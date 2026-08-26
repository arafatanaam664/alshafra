declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = 'G-TFRMD827FR';

let lastTrackedPath = '';

export function trackPageView(path: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  const url = new URL(path, window.location.origin);
  const normalizedPath = `${url.pathname}${url.search}${url.hash}`;

  if (lastTrackedPath === normalizedPath) return;
  lastTrackedPath = normalizedPath;

  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: url.toString(),
    page_path: `${url.pathname}${url.search}`,
  });
}

export {};
