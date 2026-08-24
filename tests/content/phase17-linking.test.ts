import { orphanPaths, pageTopic, scoreRelated, type LinkablePage } from '@alshafra/content/linking';
import { getAllPages } from '../../apps/web/src/content/provider';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

if (pageTopic('/date-converter') !== 'hijri') fail('converter topic');
if (scoreRelated('/gold-price/egypt', '/usd-rate/egypt') < 6) fail('country pair score');
if (scoreRelated('/date-converter', '/date-converter') !== 0) fail('self score');

const pages = getAllPages().filter((page) => page.robots.startsWith('index'));
const catalog: LinkablePage[] = pages.map((page) => ({
  path: page.path,
  title: page.title,
  h1: page.h1,
  kind: page.kind,
  robots: page.robots,
  description: page.description,
}));
const orphans = orphanPaths(catalog).filter((path) => path !== '/faq' && path !== '/about' && path !== '/contact' && path !== '/privacy' && path !== '/terms');
if (orphans.length > 8) fail(`too many orphans ${orphans.slice(0, 12).join(',')}`);

let missingRelated = 0;
for (const page of pages) {
  if (page.path === '/') continue;
  if ((page.related?.length || 0) + (page.explore?.reduce((n, group) => n + group.links.length, 0) || 0) === 0) {
    missingRelated += 1;
  }
}
if (missingRelated > 15) fail(`too many pages without related/explore: ${missingRelated}`);

console.log(JSON.stringify({ ok: true, orphans: orphans.length, missingRelated }, null, 2));
