export type RobotsDirective =
  | 'index_follow'
  | 'noindex_follow'
  | 'index_nofollow'
  | 'noindex_nofollow';

export function robotsContent(d: RobotsDirective = 'index_follow'): string {
  const map: Record<RobotsDirective, string> = {
    index_follow: 'index, follow',
    noindex_follow: 'noindex, follow',
    index_nofollow: 'index, nofollow',
    noindex_nofollow: 'noindex, nofollow',
  };
  return map[d];
}

export function isIndexableRobots(robots: string | undefined): boolean {
  const value = (robots || 'index, follow').toLowerCase();
  return value.includes('index') && !value.includes('noindex');
}
