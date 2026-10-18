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
 * Every key, URL and container id lives here. Components never hard-code
 * them. Display units (atOptions + invoke.js) cannot run in the SPA document:
 * `atOptions` is a single global, and invoke.js uses document.write().
 * <AdsterraDisplay /> runs each unit in its own srcdoc iframe.
 *
 * The same display key must not be mounted twice at once — Adsterra issued
 * one key per size. The inventory helpers below enforce that. Native banner
 * container id is also unique: only one native unit per page.
 *
 * Social Bar is declared once in index.html immediately before </body> and
 * is never injected by React.
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

export const ADSTERRA_INVOKE_ORIGIN = 'https://bauval.org';

export const ADSTERRA = {
  /** High-intent direct link — rendered as a real <a href>, never auto-opened. */
  smartlinkUrl: 'https://araplhn.org/4/cf6aab644ed54019d95388c9f15c80b1',
  /** Declared once, immediately before </body> in index.html. */
  socialBarScriptUrl: 'https://bauval.org/14/961ffd111bc36294a203779592c29a58',
  /** 4:1 "tools" layout — responsive native banner. One container id per page. */
  nativeBanner: {
    scriptUrl: 'https://bauval.org/21/d5e873c07dd501e3cbc9f8f206d70c5e',
    containerId: 'container-d5e873c07dd501e3cbc9f8f206d70c5e',
  },
  /**
   * Classic `atOptions` + invoke.js display units. Each size has its own key
   * from the Adsterra dashboard — do not invent keys or reuse a key in two
   * simultaneous slots.
   */
  displayBanners: {
    '160x300': { key: '2ebd57b62be1dcddaa8c73aa233b4b1f', width: 160, height: 300 },
    '468x60': { key: 'bfe137bd902cdaebd4965eb32c53c811', width: 468, height: 60 },
    '320x50': { key: '6d1301b116a81232f396b653e707475d', width: 320, height: 50 },
    '300x250': { key: 'eed6aec13c50bebf5887b4ecfb47da7f', width: 300, height: 250 },
    '160x600': { key: '71af4011b2e834f5ebe105a5fd0b9ca9', width: 160, height: 600 },
    '728x90': { key: '8a9c6d302dcd16cc16bab68dc5156445', width: 728, height: 90 },
  },
} as const;

export type AdsterraDisplaySize = keyof typeof ADSTERRA.displayBanners;

export type AdPlacementName = 'header' | 'content' | 'sidebar' | 'footer';

export type AdDensity = 'high' | 'standard' | 'light' | 'minimal';

/** Pages that render their own in-content native banner. */
export const PAGES_WITH_OWN_NATIVE = new Set([
  'home',
  'salaries',
  'today',
  'countdown',
  'articles',
  'hijri-calendar',
  'school-calendar',
  'holidays',
  'date-converter',
  'age-calculator',
]);

export function adDensityForRoute(name: string): AdDensity {
  switch (name) {
    case 'home':
    case 'articles':
    case 'salaries':
    case 'countdown':
    case 'hijri-calendar':
      return 'high';
    case 'today':
    case 'school-calendar':
    case 'holidays':
    case 'date-converter':
    case 'age-calculator':
    case 'name-decoration':
      return 'standard';
    case 'faq':
    case 'about':
    case 'contact':
      return 'light';
    case 'privacy':
    case 'terms':
      return 'minimal';
    default:
      return 'standard';
  }
}

export function adsterraInvokeUrl(key: string): string {
  return `${ADSTERRA_INVOKE_ORIGIN}/22/${key}`;
}

/**
 * Pick a leaderboard that fits the slot's content box. Uses the slot width,
 * not the window width alone — padding and sidebars are already subtracted
 * by the time we measure the host.
 */
export function pickLeaderboardSize(containerWidth: number): AdsterraDisplaySize | null {
  if (containerWidth >= 728) return '728x90';
  if (containerWidth >= 468) return '468x60';
  if (containerWidth >= 320) return '320x50';
  return null;
}

export function pickSidebarSize(density: AdDensity): AdsterraDisplaySize | null {
  if (density === 'high') return '160x600';
  if (density === 'standard') return '160x300';
  return null;
}

/* -------------------------------------------------------------------------- */
/* Inventory: one live mount per display key, one native banner per page      */
/* -------------------------------------------------------------------------- */

type InventoryOwner = AdPlacementName;

const displayOwners = new Map<string, InventoryOwner>();
const inventoryListeners = new Set<() => void>();

function emitInventory(): void {
  inventoryListeners.forEach((fn) => fn());
}

export function subscribeAdInventory(fn: () => void): () => void {
  inventoryListeners.add(fn);
  return () => {
    inventoryListeners.delete(fn);
  };
}

export function ownerOfDisplayKey(key: string): InventoryOwner | undefined {
  return displayOwners.get(key);
}

/**
 * Header may take a key away from footer so a shrink-to-fit resize never
 * leaves a clipped 728×90 in the header while footer still holds 468×60.
 */
function canSteal(next: InventoryOwner, current: InventoryOwner): boolean {
  return next === 'header' && current === 'footer';
}

export function claimDisplayKey(key: string, owner: InventoryOwner): boolean {
  const current = displayOwners.get(key);
  if (current && current !== owner && !canSteal(owner, current)) return false;
  displayOwners.set(key, owner);
  if (current !== owner) emitInventory();
  return true;
}

export function releaseDisplayKey(key: string, owner: InventoryOwner): void {
  if (displayOwners.get(key) !== owner) return;
  displayOwners.delete(key);
  emitInventory();
}

let nativeOwner: InventoryOwner | null = null;

export function claimNativeBanner(owner: InventoryOwner): boolean {
  if (nativeOwner && nativeOwner !== owner) return false;
  nativeOwner = owner;
  return true;
}

export function releaseNativeBanner(owner: InventoryOwner): void {
  if (nativeOwner !== owner) return;
  nativeOwner = null;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}
