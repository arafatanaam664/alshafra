import { exploreGroups, pageKindLabel } from '@alshafra/content/explore';
import { relatedFor, type LinkablePage } from '@alshafra/content/linking';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function page(path: string, extra: Partial<LinkablePage> = {}): LinkablePage {
  return {
    path,
    title: extra.title || path,
    h1: extra.h1 || extra.title || path,
    kind: extra.kind || 'page',
    robots: extra.robots || 'index, follow',
    description: extra.description || extra.title || path,
  };
}

const catalog: LinkablePage[] = [
  page('/today', { title: 'التاريخ اليوم' }),
  page('/date-converter', { title: 'تحويل التاريخ', kind: 'tool' }),
  page('/hijri-calendar', { title: 'التقويم الهجري' }),
  page('/salaries', { title: 'مواعيد الرواتب' }),
  page('/articles/hijri-to-gregorian-conversion', { title: 'شرح التحويل', kind: 'article' }),
  page('/tools', { title: 'الأدوات' }),
  page('/age-calculator', { title: 'حاسبة العمر', kind: 'tool' }),
  page('/calendar', { title: 'التقويم' }),
];

if (pageKindLabel('/date-converter') !== 'أداة') fail('converter kind label');
if (pageKindLabel('/articles/x') !== 'مقالة') fail('article kind label');

const converter = catalog.find((item) => item.path === '/date-converter')!;
const related = relatedFor(converter, catalog);
const groups = exploreGroups(converter, catalog, related);
if (!groups.some((group) => group.links.some((link) => link.path === '/today'))) {
  fail('explore must keep next-step links');
}
if (!groups.some((group) => group.links.some((link) => link.path === '/articles/hijri-to-gregorian-conversion'))) {
  fail('explore must keep conversion article');
}

const seen = new Set<string>();
for (const group of groups) {
  for (const link of group.links) {
    if (seen.has(link.path)) fail(`duplicate explore link ${link.path}`);
    seen.add(link.path);
  }
}

console.log(JSON.stringify({ ok: true, groups: groups.map((group) => [group.key, group.links.length]) }, null, 2));
