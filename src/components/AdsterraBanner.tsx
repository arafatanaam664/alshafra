import { useEffect, useRef, useState } from 'react';
import { ADSTERRA } from '../lib/ads';
import { useRoute } from '../lib/router';

interface AdsterraBannerProps {
  className?: string;
  /** Small caption above the creative. Ads must stay distinguishable from content. */
  label?: string;
}

/**
 * Adsterra native banner (script + container pair).
 *
 * The Adsterra loader fills the element whose id equals its container id, so
 * the container must exist *before* the script runs. In this SPA a container
 * is torn down on every navigation, which would kill the unit after the first
 * page — therefore every mount rebuilds the container and appends a fresh
 * script element, producing one new ad request per page view.
 *
 * Only one instance may be mounted at a time: a second instance removes the
 * first instance's script. App.tsx renders the site-wide fallback and the
 * heavy-traffic pages render their own, never both.
 */
export default function AdsterraBanner({ className = '', label = 'إعلان' }: AdsterraBannerProps) {
  const [path] = useRoute();
  const hostRef = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);
  const { containerId, scriptUrl } = ADSTERRA.nativeBanner;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    setFilled(false);
    document.querySelectorAll('script[data-adsterra-native]').forEach((s) => s.remove());
    host.replaceChildren();

    const container = document.createElement('div');
    container.id = containerId;
    container.className = 'w-full';
    host.appendChild(container);

    // Adsterra usually injects its <iframe> inside the container, but some
    // creatives are appended next to it — watch the whole host and treat any
    // rendered node as a fill.
    const observer = new MutationObserver(() => {
      if (host.querySelector('iframe, ins, img, a, div[id] > *')) setFilled(true);
    });
    observer.observe(host, { childList: true, subtree: true });

    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.dataset.adsterraNative = '';
    script.src = scriptUrl;
    host.appendChild(script);

    return () => {
      observer.disconnect();
      script.remove();
    };
  }, [path, containerId, scriptUrl]);

  // The wrapper keeps its natural width and a zero height until the creative
  // arrives: an unfilled unit (ad blocker, no inventory) therefore leaves no
  // empty box behind, while the loader still gets a laid-out element to fill.
  return (
    <div className={filled ? `my-8 ${className}` : className}>
      {filled && (
        <div className="mb-1 text-center text-[10px] uppercase tracking-wider text-brand-500/60">
          {label}
        </div>
      )}
      <div ref={hostRef} className="flex w-full justify-center overflow-hidden" />
    </div>
  );
}
