/**
 * Google AdSense configuration.
 *
 * The publisher id is declared in three places that must stay in sync:
 * index.html (the adsbygoogle.js loader + the google-adsense-account meta
 * tag) and public/ads.txt. This module is the single source of truth for
 * the ad unit ids used by <AdSlot />.
 *
 * Ad unit ids come from the AdSense dashboard (Ad units → Overview) and look
 * like "1234567890". They are intentionally empty: an <ins> with a made-up
 * slot id never fills, and repeatedly requesting unknown slots is a policy
 * risk during the AdSense review. Fill a value in and that slot appears on
 * the site on the next build — nothing else needs to change.
 */
export const ADSENSE_CLIENT = 'ca-pub-9822552442964714';

export const AD_SLOTS = {
  /** Home page — above the articles section. */
  home: '',
  /** Inside long-form articles, after the second section. */
  article: '',
  /** Countdown hub and countdown detail pages. */
  countdown: '',
  /** Today page. */
  today: '',
} as const;

export type AdSlotKey = keyof typeof AD_SLOTS;

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}
