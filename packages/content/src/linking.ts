import { normalizeArabic } from '@alshafra/search';
import { isGonePath } from '@alshafra/seo';

export { loadManualLinks, writeManualLink } from './manual-links';

export type LinkReason = 'manual' | 'cluster' | 'country' | 'countdown' | 'overlap' | 'hub';

export interface LinkablePage {
  path: string;
  title: string;
  h1: string;
  kind: string;
  robots: string;
  description?: string;
}

export interface RelatedLink {
  path: string;
  title: string;
  reason: LinkReason;
  kind: string;
}

export const MAX_AUTO_RELATED = 6;

export const CLUSTERS: Record<string, readonly string[]> = {
  'umm-al-qura': [
    '/date-converter',
    '/hijri-calendar',
    '/today',
    '/articles/hijri-to-gregorian-conversion',
    '/articles/hijri-calendar-1448',
  ],
  'saudi-salaries': [
    '/salaries',
    '/articles/salary-dates-saudi-arabia',
    '/articles/citizen-account-payment-dates',
    '/articles/developed-social-security',
    '/countdown/employee-salaries',
    '/countdown/citizen-account',
    '/countdown/retiree-salaries',
    '/countdown/social-security',
  ],
  school: [
    '/school-calendar',
    '/articles/school-calendar-1448',
    '/countdown/school-start',
    '/countdown/school-end',
    '/countdown/fall-break',
    '/countdown/midyear-break',
  ],
  calculators: [
    '/tools',
    '/tool/percentage',
    '/tool/discount',
    '/tool/bmi',
    '/tool/loan',
    '/tool/unit-converter',
    '/age-calculator',
    '/date-converter',
  ],
  prices: ['/gold-price', '/usd-rate', '/trending/gold-price-gulf', '/trending/dollar-exchange-rate-gulf'],
  holidays: [
    '/holidays',
    '/articles/official-holidays-saudi-arabia',
    '/countdown/national-day',
    '/countdown/founding-day',
    '/countdown/eid-fitr',
    '/countdown/eid-adha',
    '/countdown/ramadan',
    '/countdown/laylat-alqadr',
    '/countdown/hijri-new-year',
  ],
};

export const HUBS: Record<string, (path: string) => boolean> = {
  '/articles': (path) => path.startsWith('/articles/') && path !== '/articles',
  '/countdown': (path) => path.startsWith('/countdown/') && path !== '/countdown',
  '/trending': (path) => path.startsWith('/trending/') && path !== '/trending',
  '/gold-price': (path) => path.startsWith('/gold-price/') && path !== '/gold-price',
  '/usd-rate': (path) => path.startsWith('/usd-rate/') && path !== '/usd-rate',
  '/tools': (path) => path.startsWith('/tool/') && path !== '/tools',
};

export const STRUCTURAL_OUTBOUND: Record<string, readonly string[]> = {
  '/': ['/today', '/date-converter', '/salaries', '/countdown', '/articles', '/gold-price', '/tools', '/calendar'],
  '/today': ['/date-converter', '/hijri-calendar', '/salaries'],
  '/date-converter': ['/hijri-calendar', '/today', '/articles/hijri-to-gregorian-conversion', '/age-calculator'],
  '/hijri-calendar': ['/today', '/date-converter', '/articles/hijri-calendar-1448'],
  '/salaries': [
    '/articles/salary-dates-saudi-arabia',
    '/articles/citizen-account-payment-dates',
    '/countdown/employee-salaries',
    '/countdown/citizen-account',
  ],
  '/school-calendar': ['/articles/school-calendar-1448', '/countdown/school-start', '/holidays'],
  '/holidays': ['/articles/official-holidays-saudi-arabia', '/countdown/ramadan', '/countdown/national-day'],
  '/age-calculator': ['/date-converter', '/today', '/tools'],
  '/articles': ['/salaries', '/date-converter', '/holidays', '/articles/hijri-to-gregorian-conversion'],
  '/trending': ['/gold-price', '/usd-rate', '/tools', '/articles'],
  '/tools': ['/date-converter', '/age-calculator', '/gold-price', '/tool/percentage'],
  '/calendar': ['/today', '/date-converter', '/salaries', '/hijri-calendar'],
  '/gold-price': ['/usd-rate', '/trending/gold-price-gulf', '/tools'],
  '/usd-rate': ['/gold-price', '/trending/dollar-exchange-rate-gulf'],
  '/countdown': ['/holidays', '/salaries', '/school-calendar'],
  '/faq': ['/date-converter', '/salaries', '/today'],
};

const COUNTDOWN_LINKS: Record<string, readonly string[]> = {
  'employee-salaries': ['/salaries', '/articles/salary-dates-saudi-arabia'],
  'citizen-account': ['/salaries', '/articles/citizen-account-payment-dates'],
  'retiree-salaries': ['/salaries', '/articles/salary-dates-saudi-arabia'],
  'social-security': ['/salaries', '/articles/developed-social-security'],
  'school-start': ['/school-calendar', '/articles/school-calendar-1448'],
  'school-end': ['/school-calendar', '/articles/school-calendar-1448'],
  'fall-break': ['/school-calendar', '/articles/school-calendar-1448'],
  'midyear-break': ['/school-calendar', '/articles/school-calendar-1448'],
  ramadan: ['/holidays', '/hijri-calendar', '/articles/hijri-calendar-1448'],
  'eid-fitr': ['/holidays', '/articles/official-holidays-saudi-arabia'],
  'eid-adha': ['/holidays', '/articles/official-holidays-saudi-arabia'],
  'national-day': ['/holidays', '/articles/official-holidays-saudi-arabia'],
  'founding-day': ['/holidays', '/articles/official-holidays-saudi-arabia'],
  'hijri-new-year': ['/hijri-calendar', '/articles/hijri-calendar-1448'],
  'laylat-alqadr': ['/hijri-calendar', '/articles/hijri-calendar-1448'],
};

const STOP = new Set([
  'من',
  'في',
  'على',
  'الى',
  'إلى',
  'عن',
  'هذا',
  'هذه',
  'ذلك',
  'التي',
  'الذي',
  'كان',
  'بعد',
  'قبل',
  'بين',
  'حتى',
  'كما',
  'عند',
  'كل',
  'مع',
  'غير',
  'خلال',
  'اليوم',
  'الصفحه',
  'الموقع',
]);

export function isIndexablePage(page: Pick<LinkablePage, 'robots' | 'path'>): boolean {
  if (isGonePath(page.path)) return false;
  const robots = (page.robots || 'index, follow').toLowerCase();
  return robots.includes('index') && !robots.includes('noindex');
}

export function clusterMates(path: string): string[] {
  const out = new Set<string>();
  for (const members of Object.values(CLUSTERS)) {
    if (members.includes(path)) {
      for (const member of members) if (member !== path) out.add(member);
    }
  }
  return [...out];
}

export function countryPair(path: string): string | null {
  const gold = path.match(/^\/gold-price\/([^/]+)$/);
  if (gold) return `/usd-rate/${gold[1]}`;
  const usd = path.match(/^\/usd-rate\/([^/]+)$/);
  if (usd) return `/gold-price/${usd[1]}`;
  return null;
}

export function countdownTargets(path: string): string[] {
  const slug = path.startsWith('/countdown/') ? path.slice('/countdown/'.length) : '';
  return slug && COUNTDOWN_LINKS[slug] ? [...COUNTDOWN_LINKS[slug]] : [];
}

function tokensOf(page: LinkablePage): Set<string> {
  const text = normalizeArabic(`${page.title} ${page.h1} ${page.description || ''}`).toLowerCase();
  return new Set(
    text
      .split(/[^\p{L}\p{N}]+/u)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3 && !STOP.has(token)),
  );
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const token of a) if (b.has(token)) n += 1;
  return n;
}

function kindFamily(kind: string, path: string): string {
  if (path.startsWith('/articles/')) return 'article';
  if (path.startsWith('/countdown/')) return 'countdown';
  if (path.startsWith('/trending/')) return 'guide';
  if (path.startsWith('/gold-price') || path.startsWith('/usd-rate')) return 'prices';
  if (path.startsWith('/tool/') || path === '/tools') return 'tool';
  if (['/date-converter', '/age-calculator', '/hijri-calendar', '/today', '/salaries'].includes(path)) return 'tool';
  return kind || 'page';
}

export function relatedFor(
  page: LinkablePage,
  catalog: LinkablePage[],
  manual: Record<string, string[]> = {},
  maxAuto = MAX_AUTO_RELATED,
): RelatedLink[] {
  const byPath = new Map(catalog.map((item) => [item.path, item]));
  const seen = new Set<string>([page.path]);
  const manualLinks: RelatedLink[] = [];
  const autoLinks: RelatedLink[] = [];

  const push = (targetPath: string, reason: LinkReason, bucket: RelatedLink[]) => {
    if (seen.has(targetPath)) return;
    const target = byPath.get(targetPath);
    if (!target || !isIndexablePage(target)) return;
    seen.add(targetPath);
    bucket.push({ path: target.path, title: target.h1 || target.title, reason, kind: target.kind });
  };

  for (const dest of manual[page.path] || []) push(dest, 'manual', manualLinks);
  for (const dest of clusterMates(page.path)) push(dest, 'cluster', autoLinks);
  const pair = countryPair(page.path);
  if (pair) push(pair, 'country', autoLinks);
  for (const dest of countdownTargets(page.path)) push(dest, 'countdown', autoLinks);

  if (autoLinks.length < maxAuto) {
    const selfTokens = tokensOf(page);
    const scored = catalog
      .filter((item) => item.path !== page.path && isIndexablePage(item) && !seen.has(item.path))
      .map((item) => ({ item, score: overlapScore(selfTokens, tokensOf(item)) }))
      .filter((row) => row.score >= 2)
      .sort((a, b) => b.score - a.score);

    const usedFamilies = new Set(autoLinks.map((link) => kindFamily(link.kind, link.path)));
    for (const row of scored) {
      if (autoLinks.length >= maxAuto) break;
      const family = kindFamily(row.item.kind, row.item.path);
      if (usedFamilies.has(family) && autoLinks.length >= 3) continue;
      push(row.item.path, 'overlap', autoLinks);
      usedFamilies.add(family);
    }
    for (const row of scored) {
      if (autoLinks.length >= maxAuto) break;
      push(row.item.path, 'overlap', autoLinks);
    }
  }

  return [...manualLinks, ...autoLinks.slice(0, maxAuto)];
}

export function relatedMap(
  catalog: LinkablePage[],
  manual: Record<string, string[]> = {},
): Map<string, RelatedLink[]> {
  const map = new Map<string, RelatedLink[]>();
  for (const page of catalog) map.set(page.path, relatedFor(page, catalog, manual));
  return map;
}

export function structuralOutbound(page: LinkablePage, catalog: LinkablePage[]): string[] {
  const out = new Set<string>(STRUCTURAL_OUTBOUND[page.path] || []);
  const hub = HUBS[page.path];
  if (hub) {
    for (const item of catalog) if (hub(item.path) && isIndexablePage(item)) out.add(item.path);
  }
  return [...out];
}

export function inboundCounts(catalog: LinkablePage[], manual: Record<string, string[]> = {}): Map<string, number> {
  const counts = new Map<string, number>();
  const bump = (path: string) => counts.set(path, (counts.get(path) || 0) + 1);
  for (const page of catalog) {
    if (!isIndexablePage(page)) continue;
    for (const dest of structuralOutbound(page, catalog)) bump(dest);
    for (const link of relatedFor(page, catalog, manual)) bump(link.path);
  }
  return counts;
}

export function orphanPaths(catalog: LinkablePage[], manual: Record<string, string[]> = {}): string[] {
  const inbound = inboundCounts(catalog, manual);
  return catalog
    .filter((page) => page.path !== '/' && isIndexablePage(page) && (inbound.get(page.path) || 0) === 0)
    .map((page) => page.path);
}
