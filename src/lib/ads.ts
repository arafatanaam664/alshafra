/**
 * Advertising configuration — Google AdSense + Adsterra.
 *
 * AdSense
 * -------
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
 *
 * Adsterra
 * --------
 * Three units were issued for alshafra.com. Each one has a different delivery
 * mechanism, so each is wired up in a different place:
 *
 *   smartlink   → a plain <a href>. Rendered by <SmartlinkCard /> and by the
 *                 footer. No script involved.
 *   social bar  → a single site-wide script that MUST sit immediately before
 *                 </body>. It is declared once in index.html (which is also
 *                 the template scripts/prerender.mjs copies for all static
 *                 pages) and is never injected by React, so client-side
 *                 navigation can never load it twice.
 *   native      → script + container pair. The script fills the element whose
 *                 id equals CONTAINER_ID, so the container has to exist before
 *                 the script runs. <AdsterraBanner /> owns both.
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

export const ADSTERRA = {
  /** High-intent direct link — the single best performing unit, used site-wide. */
  smartlinkUrl: 'https://araplhn.org/4/cf6aab644ed54019d95388c9f15c80b1',
  /** Declared once, immediately before </body> in index.html. */
  socialBarScriptUrl: 'https://bauval.org/14/961ffd111bc36294a203779592c29a58',
  /** 4:1 "tools" layout — responsive native banner. */
  nativeBanner: {
    scriptUrl: 'https://bauval.org/21/d5e873c07dd501e3cbc9f8f206d70c5e',
    containerId: 'container-d5e873c07dd501e3cbc9f8f206d70c5e',
  },
} as const;

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}
