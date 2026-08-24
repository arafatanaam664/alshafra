import {
  CLUSTERS,
  HUBS,
  STRUCTURAL_OUTBOUND,
  relatedFor,
  type LinkablePage,
  type RelatedLink,
} from './linking';

export interface ExploreGroup {
  key: 'next' | 'related' | 'tools' | 'hub';
  title: string;
  links: RelatedLink[];
}

const TOOL_PATHS = new Set([
  '/tools',
  '/date-converter',
  '/age-calculator',
  '/tool/percentage',
  '/tool/discount',
  '/tool/bmi',
  '/tool/loan',
  '/gold-price',
  '/usd-rate',
]);

export function pageKindLabel(path: string): string {
  if (path === '/') return 'Alshafra';
  if (path.startsWith('/articles')) return 'مقالة';
  if (path.startsWith('/trending')) return 'دليل';
  if (path.startsWith('/tool/') || path === '/tools' || path === '/date-converter' || path === '/age-calculator') {
    return 'أداة';
  }
  if (path.startsWith('/gold-price') || path.startsWith('/usd-rate')) return 'أسعار';
  if (path.startsWith('/countdown')) return 'موعد قادم';
  if (path === '/search') return 'بحث';
  return 'التقويم والمواعيد';
}

export function hubFor(path: string): string | null {
  if (path === '/') return null;
  if (path.startsWith('/articles')) return '/articles';
  if (path.startsWith('/trending')) return '/trending';
  if (path.startsWith('/tool') || path === '/age-calculator' || path === '/date-converter') return '/tools';
  if (path.startsWith('/gold-price')) return '/gold-price';
  if (path.startsWith('/usd-rate')) return '/usd-rate';
  if (path.startsWith('/countdown')) return '/countdown';
  if (
    path === '/today' ||
    path === '/hijri-calendar' ||
    path === '/salaries' ||
    path === '/school-calendar' ||
    path === '/holidays' ||
    path === '/calendar'
  ) {
    return '/calendar';
  }
  return null;
}

function toLink(target: LinkablePage, reason: RelatedLink['reason']): RelatedLink {
  return {
    path: target.path,
    title: (target.h1 || target.title).split('|')[0].trim(),
    reason,
    kind: target.kind,
  };
}

function pushUnique(
  bucket: RelatedLink[],
  target: LinkablePage | undefined,
  reason: RelatedLink['reason'],
  seen: Set<string>,
  sourcePath: string,
) {
  if (!target || target.path === sourcePath || seen.has(target.path)) return;
  seen.add(target.path);
  bucket.push(toLink(target, reason));
}

export function exploreGroups(
  page: LinkablePage,
  catalog: LinkablePage[],
  related: RelatedLink[] = relatedFor(page, catalog),
): ExploreGroup[] {
  const byPath = new Map(catalog.map((item) => [item.path, item]));
  const seen = new Set<string>([page.path]);
  const next: RelatedLink[] = [];
  const tools: RelatedLink[] = [];
  const hubLinks: RelatedLink[] = [];

  for (const dest of STRUCTURAL_OUTBOUND[page.path] || []) {
    pushUnique(next, byPath.get(dest), 'hub', seen, page.path);
    if (next.length >= 4) break;
  }

  const relatedClean = related.filter((link) => {
    if (seen.has(link.path)) return false;
    seen.add(link.path);
    return true;
  });

  if (!TOOL_PATHS.has(page.path) && !page.path.startsWith('/tool/')) {
    for (const dest of CLUSTERS.calculators || []) {
      pushUnique(tools, byPath.get(dest), 'cluster', seen, page.path);
      if (tools.length >= 4) break;
    }
  }

  const hub = hubFor(page.path);
  if (hub && hub !== page.path) {
    const hubPage = byPath.get(hub);
    if (hubPage) pushUnique(hubLinks, hubPage, 'hub', seen, page.path);
    const matcher = HUBS[hub];
    if (matcher) {
      for (const item of catalog) {
        if (!matcher(item.path)) continue;
        pushUnique(hubLinks, item, 'hub', seen, page.path);
        if (hubLinks.length >= 5) break;
      }
    }
  }

  const groups: ExploreGroup[] = [];
  if (next.length) groups.push({ key: 'next', title: 'انتقل بعدها إلى', links: next });
  if (relatedClean.length) groups.push({ key: 'related', title: 'مواضيع ذات صلة', links: relatedClean });
  if (tools.length) groups.push({ key: 'tools', title: 'أدوات تفيدك الآن', links: tools });
  if (hubLinks.length) groups.push({ key: 'hub', title: 'المزيد في هذا القسم', links: hubLinks });
  return groups;
}
