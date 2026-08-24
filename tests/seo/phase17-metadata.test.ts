import { getAllPages } from '../../apps/web/src/content/provider';
import { isGenericTitle, resolveMetadata, validateMetadata } from '@alshafra/seo';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

const converter = resolveMetadata({
  path: '/date-converter',
  title: 'عنوان قديم | تقويم السعودية',
  h1: 'تحويل',
  description: 'قصير',
});
if (!converter.title.includes('تحويل التاريخ')) fail(`converter title ${converter.title}`);
if (/تقويم السعودية/.test(converter.title)) fail('old brand leaked into resolved title');
if (converter.h1 === 'تحويل') fail('override h1 should win');
if (converter.intent !== 'utility') fail('converter intent');

const egypt = resolveMetadata({ path: '/gold-price/egypt', title: 'ذهب', h1: 'ذهب' });
if (!egypt.title.includes('مصر')) fail(`egypt gold title ${egypt.title}`);
if (!egypt.title.endsWith('| Alshafra')) fail('country title needs brand');

if (!isGenericTitle('Untitled')) fail('generic detector');
if (isGenericTitle('تحويل التاريخ الهجري إلى ميلادي وفق أم القرى | Alshafra')) fail('real title marked generic');

const pages = getAllPages();
const titles = new Map<string, string[]>();
let invalid = 0;
for (const page of pages) {
  if (page.robots.includes('noindex')) continue;
  const seo = resolveMetadata(page);
  const errors = validateMetadata(seo);
  if (errors.length) {
    invalid += 1;
    if (invalid < 8) console.error(page.path, errors, seo.title);
  }
  const list = titles.get(seo.title) || [];
  list.push(page.path);
  titles.set(seo.title, list);
}
if (invalid) fail(`${invalid} indexable pages failed metadata validation`);

const dupes = [...titles.entries()].filter(([, paths]) => paths.length > 1);
if (dupes.length) fail(`duplicate titles ${JSON.stringify(dupes.slice(0, 5))}`);

console.log(JSON.stringify({ ok: true, pages: pages.length, indexableChecked: titles.size }, null, 2));
