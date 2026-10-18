import { memo, useEffect, useRef, useState } from 'react';
import {
  ADSTERRA,
  adsterraInvokeUrl,
  claimDisplayKey,
  ownerOfDisplayKey,
  releaseDisplayKey,
  subscribeAdInventory,
  type AdPlacementName,
  type AdsterraDisplaySize,
} from '../lib/ads';
import { trackAdMetric } from '../lib/analytics';

/**
 * Adsterra fixed-size display banner.
 *
 * The issued snippet is `atOptions = {...}` + invoke.js. Two properties of
 * that snippet make it impossible to paste into the SPA document:
 *   1. `atOptions` is a single global — two units on one page overwrite it;
 *   2. invoke.js writes its <iframe> with document.write(), and a write after
 *      the document has finished parsing replaces the whole page.
 * Each unit therefore runs inside its own srcdoc iframe: private globals, a
 * fresh request per mount, and document.write() can only affect that frame.
 *
 * srcdoc is same-origin with the parent. That is why atOptions isolation
 * works; it is not a security sandbox. We do not add a sandbox attribute:
 * allow-same-origin plus allow-scripts would still be same-origin, and a
 * unique-origin sandbox often blocks the nested ad iframe from filling.
 */
const FAIL_MS = 12000;
const SCRIPT_END = '<' + '/script>';

const FRAME_DOC = (options: string, src: string) =>
  `<!doctype html><html dir="rtl"><head>
<meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}iframe{border:0;display:block;margin:0 auto}</style>
</head><body>
<script>atOptions = ${options};${SCRIPT_END}
<script src="${src}">${SCRIPT_END}
</body></html>`;

interface AdsterraDisplayProps {
  size: AdsterraDisplaySize;
  placement: AdPlacementName;
  className?: string;
  label?: string;
  /** Above-the-fold slots skip IntersectionObserver. */
  lazy?: boolean;
  /** Reserve the key before scrolling into view (used by the global footer). */
  reserve?: boolean;
}

function AdsterraDisplay({
  size,
  placement,
  className = '',
  label = 'إعلان',
  lazy = true,
  reserve = false,
}: AdsterraDisplayProps) {
  const { key, width, height } = ADSTERRA.displayBanners[size];
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const loadedRef = useRef(false);
  const viewedRef = useRef(false);
  const [inView, setInView] = useState(!lazy);
  const [status, setStatus] = useState<'pending' | 'live' | 'blocked'>('pending');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!lazy) {
      setInView(true);
      return;
    }
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px 0px', threshold: 0 }
    );
    io.observe(host);
    return () => io.disconnect();
  }, [lazy, size]);

  const shouldClaim = reserve || inView;
  useEffect(() => {
    if (!shouldClaim) return;
    const ok = claimDisplayKey(key, placement);
    setStatus(ok ? 'live' : 'blocked');
    if (!ok) return;
    return () => releaseDisplayKey(key, placement);
  }, [shouldClaim, key, placement, size]);

  useEffect(() => {
    if (status !== 'live') return;
    return subscribeAdInventory(() => {
      if (ownerOfDisplayKey(key) !== placement) setStatus('blocked');
    });
  }, [inView, status, key, placement]);

  useEffect(() => {
    loadedRef.current = false;
    if (!inView || status !== 'live') return;
    const iframe = frameRef.current;
    if (!iframe) return;

    trackAdMetric('ad_request', { placement, unit: 'display', size });
    iframe.srcdoc = FRAME_DOC(
      JSON.stringify({ key, format: 'iframe', height, width, params: {} }),
      adsterraInvokeUrl(key)
    );

    const hasCreative = () => {
      const doc = iframe.contentDocument;
      if (!doc?.body) return false;
      return Boolean(doc.body.querySelector('iframe, ins, img, a'));
    };

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (hasCreative()) {
        if (!loadedRef.current) {
          loadedRef.current = true;
          trackAdMetric('ad_detected', { placement, unit: 'display', size });
        }
        window.clearInterval(timer);
      } else if (attempts >= FAIL_MS / 500) {
        window.clearInterval(timer);
        if (!loadedRef.current) setFailed(true);
      }
    }, 500);

    return () => {
      window.clearInterval(timer);
      loadedRef.current = false;
      iframe.removeAttribute('srcdoc');
    };
  }, [inView, status, key, width, height, placement, size]);

  useEffect(() => {
    if (!inView || status !== 'live' || failed) return;
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewedRef.current) {
          viewedRef.current = true;
          trackAdMetric('ad_slot_view', { placement, unit: 'display', size });
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(host);
    return () => io.disconnect();
  }, [inView, status, failed, placement, size]);

  if (failed || status === 'blocked') return null;

  return (
    <aside className={`my-6 ${className}`} aria-label={label} ref={hostRef}>
      <div className="mb-1 text-center text-[10px] uppercase tracking-wider text-brand-500/60">
        {label}
      </div>
      <div className="flex w-full justify-center">
        <div
          className="bg-sand-50/80"
          style={{ width, height }}
        >
          {inView && status === 'live' && (
            <iframe
              ref={frameRef}
              title={label}
              width={width}
              height={height}
              scrolling="no"
              referrerPolicy="origin"
              className="block border-0"
              style={{ width, height }}
            />
          )}
        </div>
      </div>
    </aside>
  );
}

export default memo(AdsterraDisplay);
