import { selfCanonical } from './canonical';
import { isIndexableRobots } from './robots';
import { SITE_URL } from './site';

export type SitemapBucket = 'core' | 'articles' | 'guides' | 'tools' | 'calendar';

export const SITEMAP_BUCKETS: SitemapBucket[] = ['core', 'articles', 'guides', 'tools', 'calendar'];

export interface SitemapEntry {
  path: string;
  lastmod?: string;
  robots?: string;
}

export function sitemapBucket(path: string): SitemapBucket {
  if (path.startsWith('/articles/') && path !== '/articles') return 'articles';
  if (path.startsWith('/trending/') && path !== '/trending') return 'guides';
  if (path.startsWith('/countdown/') || path.startsWith('/gold-price') || path.startsWith('/usd-rate')) return 'tools';
  if (path === '/date-converter' || path === '/age-calculator') return 'tools';
  if (['/today', '/hijri-calendar', '/school-calendar', '/holidays', '/salaries'].includes(path)) return 'calendar';
  return 'core';
}

export function sitemapLoc(path: string): string {
  return selfCanonical(path);
}

export function filterIndexable(entries: SitemapEntry[]): SitemapEntry[] {
  return entries.filter((entry) => isIndexableRobots(entry.robots));
}

export function entriesForBucket(entries: SitemapEntry[], bucket: SitemapBucket): SitemapEntry[] {
  return filterIndexable(entries).filter((entry) => sitemapBucket(entry.path) === bucket);
}

export function urlsetXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const last = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : '';
      return `  <url><loc>${sitemapLoc(entry.path)}</loc>${last}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function sitemapIndexXml(siteUrl = SITE_URL): string {
  const body = SITEMAP_BUCKETS.map(
    (bucket) => `  <sitemap><loc>${siteUrl}/sitemaps/${bucket}.xml</loc></sitemap>`,
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}
