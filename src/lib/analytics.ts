/**
 * Google Analytics 4 (GA4) — page-view tracking for a client-routed SPA.
 *
 * Why this file is needed:
 * `gtag('config', ...)` in index.html reports the page the visitor landed on.
 * Every in-app navigation afterwards goes through `history.pushState` and
 * never reloads the document, so without extra work GA counts exactly one
 * page view per session no matter how much of the site the visitor browses.
 *
 * GA4's Enhanced Measurement ("Page changes based on browser history events")
 * does catch those navigations on its own, but it reads `document.title`
 * before React has re-rendered the new page — so the recorded title is the
 * *previous* page's. We therefore report the page view ourselves, once React
 * has committed the new page, and we watch the dataLayer so we never report a
 * navigation GA4 has already reported (double-counting every page view would
 * wreck the bounce rate and the session/pageview ratio).
 */

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: Gtag;
  }
}

/**
 * gtag's history handler fires straight after pushState, but a short window
 * keeps us safe if it ever defers the event.
 */
const AUTO_DETECT_WINDOW_MS = 300;

let watcherInstalled = false;
let sendingManually = false;
let autoPageViewDetected = false;
let warnedAboutAutoTracking = false;

function isPageViewEntry(entry: unknown): boolean {
  if (!entry || typeof entry !== 'object') return false;
  const record = entry as Record<string, unknown>;
  // gtag('event', 'page_view', {...}) pushes an array-like Arguments object.
  if (record[0] === 'event' && record[1] === 'page_view') return true;
  // gtag.js's own auto page_view is pushed as a plain object.
  return record.event === 'page_view';
}

/**
 * Wraps dataLayer.push so we can see the page views GA4 generates on its own.
 * Installed as early as the app boots — a history change that happens before
 * the watcher exists would go unnoticed and be counted twice.
 */
export function installAnalyticsWatcher(): void {
  if (watcherInstalled) return;
  const layer = window.dataLayer;
  if (!layer) return;

  const originalPush = layer.push.bind(layer);
  layer.push = function patchedPush(...items: unknown[]) {
    if (!sendingManually) {
      for (const item of items) {
        if (isPageViewEntry(item)) autoPageViewDetected = true;
      }
    }
    return originalPush(...items);
  };

  watcherInstalled = true;
}

function warnAboutAutoTracking(): void {
  if (warnedAboutAutoTracking) return;
  warnedAboutAutoTracking = true;
  console.warn(
    '[GA4] تم رصد أن GA4 يتتبّع تغيّر المسار تلقائياً، لذلك لم تُرسل صفحة جديدة يدوياً ' +
      'حتى لا تُحتسب مرتين. لكن عنوان الصفحة المسجّل قد يكون عنوان الصفحة السابقة. ' +
      'لأجل تسجيل عنوان صحيح: الإدارة ← مصادر البيانات ← الويب ← القياس المحسّن ← ' +
      'إظهار الإعدادات المتقدمة ← أوقف "Page changes based on browser history events".'
  );
}

/**
 * Reports a page view for a client-side navigation.
 *
 * @param path the path that was just navigated to (e.g. "/salaries")
 */
export function trackPageView(path: string): void {
  if (typeof window.gtag !== 'function') return;
  installAnalyticsWatcher();

  window.setTimeout(() => {
    const alreadyReported = autoPageViewDetected;
    autoPageViewDetected = false;

    if (alreadyReported) {
      warnAboutAutoTracking();
      return;
    }

    sendingManually = true;
    try {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: path,
      });
    } finally {
      sendingManually = false;
    }
  }, AUTO_DETECT_WINDOW_MS);
}

export type AdMetricEvent = 'ad_request' | 'ad_detected' | 'ad_slot_view';

/**
 * First-party estimates for ad slots. `ad_request` is our decision to load a
 * unit; `ad_detected` means the isolated frame produced some markup (not a
 * paid impression); `ad_slot_view` means the slot crossed 50% visibility.
 * These are not Adsterra dashboard numbers.
 */
export function trackAdMetric(
  event: AdMetricEvent,
  params: { placement: string; unit: string; size?: string }
): void {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', event, {
    ad_placement: params.placement,
    ad_unit: params.unit,
    ad_size: params.size ?? '',
  });
}
