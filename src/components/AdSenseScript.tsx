import { useEffect } from 'react';

const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9822552442964714';

/** Loads the ad network only on eligible public routes, never on admin/404. */
export default function AdSenseScript() {
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-alshafra-adsense]');
    if (existing) return;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = ADSENSE_SRC;
    script.dataset.alshafraAdsense = 'true';
    document.head.appendChild(script);
    return () => script.remove();
  }, []);
  return null;
}
