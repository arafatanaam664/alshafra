import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  breadcrumbsFor,
  buildJsonLdGraph,
  documentTitle,
  entriesForBucket,
  filterIndexable,
  graphHasSearchAction,
  graphHasType,
  hreflangAlternates,
  isGonePath,
  neverAutoBrandSuffix,
  relNextPrev,
  schemaTypesFor,
  selfCanonical,
  sitemapBucket,
  sitemapIndexXml,
  SITEMAP_BUCKETS,
} from '@alshafra/seo';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

const article = buildJsonLdGraph({
  path: '/articles/hijri-to-gregorian-conversion',
  title: 'تحويل التاريخ الهجري والميلادي وفق أم القرى',
  description: 'تحويل التاريخ الهجري والميلادي وفق أم القرى.',
  h1: 'تحويل التاريخ الهجري إلى ميلادي',
  kind: 'article',
  faq: [
    { q: 'هل تحويل أم القرى دقيق؟', a: 'دقيق بالنسبة للجدول.' },
    { q: 'لماذا يختلف يوم؟', a: 'اختلاف التقويم أو المنطقة الزمنية.' },
  ],
  datePublished: '2026-08-12',
});

if (!graphHasType(article, 'Article')) fail('article graph missing Article');
if (!graphHasType(article, 'FAQPage')) fail('article graph missing FAQPage');
if (!graphHasType(article, 'BreadcrumbList')) fail('article graph missing BreadcrumbList');
if (!graphHasType(article, 'Organization')) fail('missing Organization');
if (!graphHasType(article, 'WebSite')) fail('missing WebSite');
if (!graphHasSearchAction(article)) fail('SearchAction required now that /search exists');
if (graphHasType(article, 'JobPosting')) fail('do not invent JobPosting');
if (graphHasType(article, 'Product')) fail('do not invent Product');

const toolPage = {
  path: '/date-converter',
  title: 'تحويل التاريخ',
  description: 'أداة تحويل',
  h1: 'تحويل التاريخ بين الهجري والميلادي',
  kind: 'tool',
  island: 'date-converter',
};
const tool = buildJsonLdGraph(toolPage);
if (!graphHasType(tool, 'WebApplication')) fail('tool missing WebApplication');
if (schemaTypesFor(toolPage).includes('Article')) fail('tool must not be Article');

const newToolPage = {
  path: '/tool/percentage',
  title: 'حاسبة النسبة المئوية',
  description: 'احسب النسبة',
  h1: 'حاسبة النسبة المئوية',
  kind: 'tool',
  island: 'tool',
};
const newTool = buildJsonLdGraph(newToolPage);
if (!graphHasType(newTool, 'WebApplication')) fail('new /tool page missing WebApplication');
if (schemaTypesFor(newToolPage).includes('Article')) fail('new tool must not be Article');

const event = buildJsonLdGraph({
  path: '/countdown/ramadan',
  title: 'رمضان',
  description: 'عداد',
  h1: 'كم باقي على رمضان',
  kind: 'countdown',
  isoDate: '2027-02-18',
});
if (!graphHasType(event, 'Event')) fail('countdown missing Event');

const crumbs = breadcrumbsFor('/articles/hijri-to-gregorian-conversion', 'تحويل');
if (crumbs[0]?.path !== '/' || crumbs[1]?.path !== '/articles') fail(`bad crumbs ${JSON.stringify(crumbs)}`);

if (selfCanonical('/date-converter/') !== 'https://alshafra.com/date-converter') fail('canonical trailing slash');
if (documentTitle({ title: 'أ', seoTitle: 'ب' }) !== 'ب') fail('seoTitle must win');
if (!neverAutoBrandSuffix('موعد الرواتب الحكومية 2026 و2027 وجدول الصرف')) fail('inner title must stay unsuffixed');
if (neverAutoBrandSuffix('x | Alshafra') !== false) fail('detect auto suffix');

if (hreflangAlternates('/today').length !== 0) fail('no fake hreflang for a single locale');
if (hreflangAlternates('/today', ['ar', 'en']).length !== 2) fail('hreflang ready when two locales exist');

const paging = relNextPrev({ path: '/articles', page: 1, totalPages: 1 });
if (paging.next || paging.prev) fail('no pagination links on single page');

if (!isGonePath('/news/old') || !isGonePath('/category/x')) fail('410 prefixes');

if (sitemapBucket('/articles/x') !== 'articles') fail('articles bucket');
if (sitemapBucket('/trending/foo') !== 'guides') fail('guides bucket');
if (sitemapBucket('/date-converter') !== 'tools') fail('tools bucket');
if (sitemapBucket('/salaries') !== 'calendar') fail('calendar bucket');
if (sitemapBucket('/') !== 'core') fail('core bucket');

const indexXml = sitemapIndexXml();
for (const bucket of SITEMAP_BUCKETS) {
  if (!indexXml.includes(`/sitemaps/${bucket}.xml`)) fail(`index missing ${bucket}`);
}
if (indexXml.includes('community.xml')) fail('do not advertise empty community sitemap');

const mixed = filterIndexable([
  { path: '/', robots: 'index, follow' },
  { path: '/draft', robots: 'noindex, follow' },
]);
if (mixed.length !== 1) fail('noindex leaked into sitemap set');
if (entriesForBucket([{ path: '/draft', robots: 'noindex, follow' }], 'core').length) fail('noindex in bucket');

const vercel = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')) as {
  buildCommand: string;
  routes: { src: string; status: number }[];
};
if (vercel.buildCommand !== 'npm run build') fail('Astro remains the public renderer');
if (!vercel.routes.some((r) => r.status === 410 && r.src.includes('category'))) fail('410 still required');

console.log(
  JSON.stringify(
    {
      ok: true,
      articleTypes: schemaTypesFor({
        path: '/articles/x',
        title: 't',
        description: 'd',
        h1: 'h',
        kind: 'article',
        faq: [
          { q: '1', a: 'a' },
          { q: '2', a: 'b' },
        ],
      }),
      sitemapBuckets: SITEMAP_BUCKETS,
    },
    null,
    2,
  ),
);
