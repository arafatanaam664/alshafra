import { useEffect, useRef, useState } from 'react';
import { ADSTERRA, type AdsterraDisplaySize } from '../lib/ads';

/**
 * Adsterra fixed-size display banner (160x300, 468x60, 320x50, 300x250).
 *
 * These units ship as `atOptions = {...}` + invoke.js. Two properties of that
 * snippet make it impossible to paste straight into a React app:
 *   1. `atOptions` is a single global — two units on one page overwrite it;
 *   2. invoke.js writes its <iframe> with document.write(), and a write after
 *      the document has finished parsing replaces the whole page.
 * Running each unit inside its own same-origin `srcdoc` iframe solves both:
 * the unit gets a private window/document, a fresh request per mount, and a
 * document.write() can only ever affect that frame.
 */
const SCRIPT_HOST = 'https://bauval.org/22/';

const FRAME_DOC = (options: string, src: string) => `<!doctype html><html dir="rtl"><head>
<meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}iframe{border:0;display:block;margin:0 auto}img{max-width:100%}</style>
</head><body>
<script>atOptions = ${options};\x3c/script>
<script src="${src}">\x3c/script>
</body></html>`;

interface AdsterraDisplayProps {
  size: AdsterraDisplaySize;
  className?: string;
  /** Visible caption — ads must stay distinguishable from editorial content. */
  label?: string;
}

export default function AdsterraDisplay({
  size,
  className = '',
  label = 'إعلان',
}: AdsterraDisplayProps) {
  const { key, width, height } = ADSTERRA.displayBanners[size];
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [filled, setFilled] = useState(false);

  const options = JSON.stringify({ key, format: 'iframe', height, width, params: {} });
  const srcDoc = FRAME_DOC(options, SCRIPT_HOST + key);

  useEffect(() => {
    setFilled(false);
    let attempts = 0;
    const hasAd = () => {
      const doc = frameRef.current?.contentDocument;
      return Boolean(doc?.body?.querySelector('iframe, ins, img, a'));
    };
    const timer = window.setInterval(() => {
      attempts += 1;
      if (hasAd()) {
        setFilled(true);
        window.clearInterval(timer);
      } else if (attempts >= 60) {
        window.clearInterval(timer);
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [size]);

  return (
    <div className={filled ? `my-6 ${className}` : 'h-0 overflow-hidden'}>
      {filled && (
        <div className="mb-1 text-center text-[10px] uppercase tracking-wider text-brand-500/60">
          {label}
        </div>
      )}
      <div className="flex w-full justify-center overflow-hidden">
        <iframe
          ref={frameRef}
          title={label}
          srcDoc={srcDoc}
          width={width}
          height={height}
          scrolling="no"
          className="border-0"
          style={{ maxWidth: '100%' }}
        />
      </div>
    </div>
  );
}

/**
 * Picks the 320x50 unit on phones and the 468x60 unit from 640px up, so a
 * fixed-size banner never overflows a narrow viewport. Only one of the two is
 * ever mounted, which keeps it to a single ad request per slot.
 */
export function AdsterraResponsiveDisplay({
  className = '',
  label = 'إعلان',
}: {
  className?: string;
  label?: string;
}) {
  const query = '(max-width: 639px)';
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setNarrow(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <AdsterraDisplay size={narrow ? '320x50' : '468x60'} className={className} label={label} />
  );
}
