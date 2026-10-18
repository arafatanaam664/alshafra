import { useEffect, useRef, useState } from 'react';
import {
  ADSTERRA,
  claimNativeBanner,
  releaseNativeBanner,
  type AdPlacementName,
} from '../lib/ads';
import { useRoute } from '../lib/router';
import { trackAdMetric } from '../lib/analytics';

interface AdsterraBannerProps {
  className?: string;
  label?: string;
  placement?: AdPlacementName;
  lazy?: boolean;
}

/**
 * Adsterra native banner (script + container pair).
 *
 * The loader fills the element whose id equals CONTAINER_ID, so the container
 * must exist before the script runs. In this SPA the container is torn down
 * on navigation — every real page change rebuilds the pair. Only one instance
 * may be mounted: a second claim is refused so two copies never compete for
 * the same id.
 *
 * Cleanup removes this instance's script only. It does not sweep every
 * Adsterra script on the page (Social Bar lives in index.html and must stay).
 */
export default function AdsterraBanner({
  className = '',
  label = 'إعلان',
  placement = 'content',
  lazy = true,
}: AdsterraBannerProps) {
  const [path] = useRoute();
  const hostRef = useRef<HTMLDivElement>(null);
  const viewedRef = useRef(false);
  const [inView, setInView] = useState(!lazy);
  const [allowed, setAllowed] = useState(false);
  const [filled, setFilled] = useState(false);
  const [failed, setFailed] = useState(false);
  const { containerId, scriptUrl } = ADSTERRA.nativeBanner;

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
  }, [lazy, path]);

  useEffect(() => {
    setFilled(false);
    setFailed(false);
    viewedRef.current = false;

    if (!inView) {
      setAllowed(false);
      return;
    }

    const host = hostRef.current;
    if (!host) return;

    if (!claimNativeBanner(placement)) {
      setAllowed(false);
      return;
    }
    setAllowed(true);
    trackAdMetric('ad_request', { placement, unit: 'native' });

    host.replaceChildren();

    const container = document.createElement('div');
    container.id = containerId;
    container.className = 'w-full';
    host.appendChild(container);

    const observer = new MutationObserver(() => {
      if (host.querySelector('iframe, ins, img, a')) {
        setFilled(true);
        trackAdMetric('ad_detected', { placement, unit: 'native' });
        observer.disconnect();
      }
    });
    observer.observe(host, { childList: true, subtree: true });

    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.dataset.adsterraNative = '';
    script.src = scriptUrl;
    script.onerror = () => setFailed(true);
    host.appendChild(script);

    const timeout = window.setTimeout(() => {
      if (!host.querySelector('iframe, ins, img, a')) setFailed(true);
    }, 12000);

    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
      script.remove();
      host.replaceChildren();
      releaseNativeBanner(placement);
    };
  }, [path, inView, containerId, scriptUrl, placement]);

  useEffect(() => {
    if (!allowed || failed) return;
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewedRef.current) {
          viewedRef.current = true;
          trackAdMetric('ad_slot_view', { placement, unit: 'native' });
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(host);
    return () => io.disconnect();
  }, [allowed, failed, placement, path]);

  if (failed || (inView && !allowed)) return null;

  return (
    <aside className={filled ? `my-8 ${className}` : className} aria-label={label}>
      {allowed && (
        <div className="mb-1 text-center text-[10px] uppercase tracking-wider text-brand-500/60">
          {label}
        </div>
      )}
      <div
        ref={hostRef}
        className="flex w-full justify-center"
        style={allowed && !filled ? { minHeight: 90 } : undefined}
      />
    </aside>
  );
}
