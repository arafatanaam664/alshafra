import {
  clusterMates,
  countryPair,
  inboundCounts,
  isIndexablePage,
  MAX_AUTO_RELATED,
  orphanPaths,
  relatedFor,
  type LinkablePage,
} from '@alshafra/content/linking';

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
  page('/'),
  page('/date-converter', { kind: 'tool', title: 'تحويل التاريخ أم القرى', h1: 'تحويل التاريخ' }),
  page('/hijri-calendar', { kind: 'calendar_content', title: 'التقويم الهجري' }),
  page('/today', { kind: 'calendar_content', title: 'اليوم' }),
  page('/articles/hijri-to-gregorian-conversion', {
    kind: 'article',
    title: 'تحويل التاريخ الهجري إلى ميلادي',
    h1: 'تحويل التاريخ الهجري إلى ميلادي',
  }),
  page('/articles/hijri-calendar-1448', { kind: 'article', title: 'التقويم الهجري 1448' }),
  page('/salaries', { kind: 'calendar_content', title: 'مواعيد الرواتب' }),
  page('/articles/salary-dates-saudi-arabia', { kind: 'article', title: 'موعد صرف رواتب الموظفين' }),
  page('/gold-price/egypt', { kind: 'gold', title: 'سعر الذهب في مصر' }),
  page('/usd-rate/egypt', { kind: 'usd', title: 'سعر الدولار في مصر' }),
  page('/gold-price/saudi-arabia', { kind: 'gold', title: 'سعر الذهب في السعودية' }),
  page('/usd-rate/saudi-arabia', { kind: 'usd', title: 'سعر الدولار في السعودية' }),
  page('/countdown/ramadan', { kind: 'countdown', title: 'رمضان' }),
  page('/holidays', { kind: 'calendar_content', title: 'الإجازات الرسمية' }),
  page('/articles', { kind: 'collection', title: 'المقالات' }),
  page('/draft', { kind: 'article', title: 'مسودة', robots: 'noindex, follow' }),
];

if (!clusterMates('/date-converter').includes('/articles/hijri-to-gregorian-conversion')) {
  fail('converter cluster missing conversion article');
}
if (countryPair('/gold-price/egypt') !== '/usd-rate/egypt') fail('gold/usd pair');

const converter = relatedFor(catalog.find((p) => p.path === '/date-converter')!, catalog);
if (!converter.some((link) => link.path === '/articles/hijri-to-gregorian-conversion' && link.reason === 'cluster')) {
  fail(`converter should link conversion article: ${JSON.stringify(converter)}`);
}

const article = relatedFor(catalog.find((p) => p.path === '/articles/hijri-to-gregorian-conversion')!, catalog);
if (!article.some((link) => link.path === '/date-converter')) fail('article should link converter');

const gold = relatedFor(catalog.find((p) => p.path === '/gold-price/egypt')!, catalog);
if (!gold.some((link) => link.path === '/usd-rate/egypt' && link.reason === 'country')) fail('egypt gold should pair usd');

const ramadan = relatedFor(catalog.find((p) => p.path === '/countdown/ramadan')!, catalog);
if (!ramadan.some((link) => link.path === '/holidays')) fail('ramadan should link holidays');

const manual = relatedFor(catalog.find((p) => p.path === '/today')!, catalog, {
  '/today': ['/salaries'],
});
if (manual[0]?.path !== '/salaries' || manual[0]?.reason !== 'manual') fail('manual links must be first');

if (converter.some((link) => link.path === '/draft')) fail('must not auto-link noindex');
if (converter.length - converter.filter((l) => l.reason === 'manual').length > MAX_AUTO_RELATED) {
  fail('auto related exceeded cap');
}

const inbound = inboundCounts(catalog);
if ((inbound.get('/articles/hijri-to-gregorian-conversion') || 0) < 1) fail('article missing inbound');
const orphans = orphanPaths(catalog);
if (orphans.includes('/articles/hijri-to-gregorian-conversion')) fail('cluster article flagged orphan');
if (!isIndexablePage(page('/x')) || isIndexablePage(page('/y', { robots: 'noindex, follow' }))) {
  fail('indexable helper');
}

console.log(
  JSON.stringify(
    {
      ok: true,
      converter: converter.map((l) => l.path),
      gold: gold.map((l) => l.path),
      ramadan: ramadan.map((l) => l.path),
      orphans,
    },
    null,
    2,
  ),
);
