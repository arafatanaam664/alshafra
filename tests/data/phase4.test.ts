/**
 * Phase 4: real Postgres (PGlite) migrations + seed + idempotent legacy import + 127 URL parity.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { applyMigrations, fromPglite, seedDatabase } from '@alshafra/database';
import { collectParity, importLegacyContent } from '../../packages/content/src/legacy-import';

const root = process.cwd();

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

async function main() {
  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  const client = fromPglite(db);

  const applied = await applyMigrations(client);
  if (applied.length < 8) fail(`Expected several migrations, got ${applied.length}: ${applied.join(',')}`);

  const tables = await client.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
  );
  if ((tables.rows[0]?.n ?? 0) < 40) fail(`Too few tables: ${tables.rows[0]?.n}`);

  const rls = await client.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relrowsecurity = true`,
  );
  if ((rls.rows[0]?.n ?? 0) < 20) fail(`RLS not enabled on enough tables: ${rls.rows[0]?.n}`);

  const seeded = await seedDatabase(client);
  if (seeded.flags < 20) fail(`Flag seed too small: ${seeded.flags}`);
  if (seeded.redirects !== 4) fail(`Expected 4 redirects, got ${seeded.redirects}`);

  const gone = await client.query<{ source_pattern: string; status_code: number }>(
    `SELECT source_pattern, status_code FROM redirects WHERE is_enabled = true ORDER BY source_pattern`,
  );
  const patterns = gone.rows.map((r) => r.source_pattern);
  for (const p of ['/category/*', '/languages/*', '/news/*']) {
    if (!patterns.includes(p)) fail(`Missing 410 pattern ${p}`);
  }
  const cat = gone.rows.find((r) => r.source_pattern === '/category/*');
  if (cat?.status_code !== 410) fail('category prefix must be 410');

  const cal = await client.query<{ is_enabled: boolean }>('SELECT is_enabled FROM feature_flags WHERE key = $1', [
    'calendar_enabled',
  ]);
  if (cal.rows[0]?.is_enabled !== true) fail('calendar_enabled must default true');
  const comm = await client.query<{ is_enabled: boolean }>('SELECT is_enabled FROM feature_flags WHERE key = $1', [
    'community_enabled',
  ]);
  if (comm.rows[0]?.is_enabled !== false) fail('community_enabled must default false');

  const first = await importLegacyContent(client, root);
  const second = await importLegacyContent(client, root);
  const parity = await collectParity(client, root);

  if (parity.published !== 127) fail(`published.json is ${parity.published}, expected 127`);
  if (parity.routes !== 127) fail(`routes ${parity.routes}, expected 127`);
  if (parity.documents !== 127) fail(`documents ${parity.documents}, expected 127`);
  if (parity.missing.length) fail(`Missing paths: ${parity.missing.join(', ')}`);
  if (parity.mismatches.length) fail(`Parity mismatches: ${parity.mismatches.slice(0, 20).join(', ')}`);

  const dup = await client.query<{ n: number }>('SELECT count(*)::int AS n FROM (SELECT path FROM routes GROUP BY path HAVING count(*) > 1) t');
  if ((dup.rows[0]?.n ?? 0) !== 0) fail('Duplicate routes');

  if (second.counts.documents !== first.counts.documents) {
    fail(`Idempotent import changed document count ${first.counts.documents} → ${second.counts.documents}`);
  }

  const required = [
    '/',
    '/date-converter',
    '/hijri-calendar',
    '/today',
    '/salaries',
    '/school-calendar',
    '/holidays',
    '/countdown',
    '/age-calculator',
    '/articles',
  ];
  for (const path of required) {
    const row = first.snapshot.routes.find((r) => r.path === path);
    if (!row) fail(`Snapshot missing ${path}`);
    if (!row.canonicalUrl.startsWith('https://alshafra.com')) fail(`Bad canonical ${path}`);
    if (row.robots.includes('noindex')) fail(`Accidental noindex ${path}`);
  }

  const tools = await client.query<{ n: number }>('SELECT count(*)::int AS n FROM tools');
  if ((tools.rows[0]?.n ?? 0) < 10) fail(`Expected legacy tools, got ${tools.rows[0]?.n}`);

  const gold = await client.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM calendar_events WHERE key = 'hijri-new-year-1448' AND gregorian_date = '2026-06-16'`,
  );
  if ((gold.rows[0]?.n ?? 0) !== 1) fail('Golden probe 1 Muharram 1448 / 2026-06-16 missing from calendar_events');

  const metrics = await client.query<{ n: number }>('SELECT count(*)::int AS n FROM content_metrics');
  if ((metrics.rows[0]?.n ?? 0) !== 127) fail(`content_metrics should be 127 zeros, got ${metrics.rows[0]?.n}`);

  const views = await client.query<{ s: number }>('SELECT coalesce(sum(views),0)::int AS s FROM content_metrics');
  if ((views.rows[0]?.s ?? 0) !== 0) fail('Do not invent view counts');

  const pubPath = join(root, 'apps/web-legacy/public/published.json');
  if (!existsSync(pubPath)) fail('published.json missing');
  const pub = JSON.parse(readFileSync(pubPath, 'utf8'));
  if (pub.published.length !== 127) fail('published.json changed');

  console.log(
    JSON.stringify(
      {
        ok: true,
        migrations: applied.length,
        tables: tables.rows[0]?.n,
        rlsTables: rls.rows[0]?.n,
        seed: seeded,
        first: first.counts,
        secondDocuments: second.counts.documents,
        parity,
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
