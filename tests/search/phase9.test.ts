import { applyMigrations, fromPglite, seedDatabase } from '@alshafra/database';
import { CatalogSearchProvider, prepareQuery, normalizeArabic } from '@alshafra/search';
import { PostgresSearchProvider } from '../../packages/search/src/postgres.ts';
import { importLegacyContent } from '../../packages/content/src/legacy-import.ts';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

const docs = [
  {
    path: '/date-converter',
    title: 'تحويل التاريخ بين الهجري والميلادي',
    h1: 'تحويل التاريخ',
    description: 'وفق تقويم أم القرى',
    kind: 'tool',
  },
  {
    path: '/salaries',
    title: 'مواعيد صرف الرواتب والدعم',
    h1: 'مواعيد الرواتب',
    description: 'رواتب الموظفين وحساب المواطن',
    kind: 'calendar_content',
  },
  {
    path: '/draft',
    title: 'مسودة',
    description: 'لا تظهر',
    kind: 'article',
  },
];

async function main() {
  const normalized = normalizeArabic('أُمّ القُرَى');
  if (!normalized.startsWith('ام ال')) fail(`tashkeed/alef normalize: ${normalized}`);
  const prepared = prepareQuery('ام القرى');
  if (!prepared.tokens.length) fail('prepareQuery tokens');
  if (!prepared.expanded.includes('umm') && !prepared.expanded.includes('قري')) fail(`synonym expand: ${prepared.expanded}`);

  const catalog = new CatalogSearchProvider(docs);
  const umm = await catalog.search({ q: 'أم القرى' });
  if (!umm.hits.some((hit) => hit.path === '/date-converter')) fail(`أم القرى should find converter ${JSON.stringify(umm)}`);

  const latin = await catalog.search({ q: 'umm al qura' });
  if (!latin.hits.some((hit) => hit.path === '/date-converter')) fail('synonym umm al qura');

  const salary = await catalog.search({ q: 'روات' });
  if (!salary.hits.some((hit) => hit.path === '/salaries')) fail('prefix روات should find salaries');

  const empty = await catalog.search({ q: '' });
  if (empty.hits.length) fail('empty query must not list everything');

  const typo = await catalog.search({ q: 'الروات' });
  if (!typo.hits.some((hit) => hit.path === '/salaries')) fail('light typo should still rank salaries');

  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  const client = fromPglite(db);
  await applyMigrations(client);
  await seedDatabase(client);
  await importLegacyContent(client, process.cwd());
  const pg = new PostgresSearchProvider(client);
  const pgHits = await pg.search({ q: 'أم القرى' });
  if (!pgHits.hits.length) fail(`postgres FTS returned nothing for أم القرى: ${JSON.stringify(pgHits)}`);
  const logged = await client.query<{ n: number }>('SELECT count(*)::int AS n FROM search_queries');
  if (!logged.rows[0]?.n) fail('search_queries not recorded');

  console.log(
    JSON.stringify(
      {
        ok: true,
        catalog: umm.hits.map((h) => h.path),
        postgres: pgHits.hits.slice(0, 5).map((h) => h.path),
        recorded: logged.rows[0].n,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
