export type RobotsDirective =
  | 'index_follow'
  | 'noindex_follow'
  | 'index_nofollow'
  | 'noindex_nofollow';

export interface SeoInput {
  title: string;
  seoTitle?: string;
  path: string;
  siteUrl?: string;
  robots?: RobotsDirective;
}

export function documentTitle(input: Pick<SeoInput, 'title' | 'seoTitle'>): string {
  return input.seoTitle?.trim() || input.title;
}

export function selfCanonical(path: string, siteUrl = 'https://alshafra.com'): string {
  const p = path === '/' ? '/' : path.replace(/\/+$/, '');
  return `${siteUrl.replace(/\/+$/, '')}${p}`;
}

export function robotsContent(d: RobotsDirective = 'index_follow'): string {
  const map: Record<RobotsDirective, string> = {
    index_follow: 'index, follow',
    noindex_follow: 'noindex, follow',
    index_nofollow: 'index, nofollow',
    noindex_nofollow: 'noindex, nofollow',
  };
  return map[d];
}
