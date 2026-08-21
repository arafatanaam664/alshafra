import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyMigrations, fromPglite, seedDatabase } from '@alshafra/database';
import { defaultSnapshotPath, refreshPublicSnapshot } from './export-snapshot';
import { importLegacyContent } from './legacy-import';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');

async function main() {
  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  const client = fromPglite(db);
  await applyMigrations(client);
  await seedDatabase(client);
  await importLegacyContent(client, repoRoot);
  const published = JSON.parse(readFileSync(join(repoRoot, 'apps/web-legacy/public/published.json'), 'utf8')) as {
    published: { path: string }[];
  };
  const dest = process.env.ALSHAFRA_SNAPSHOT_PATH || defaultSnapshotPath(repoRoot);
  const result = await refreshPublicSnapshot(client, dest, new Set(published.published.map((row) => row.path)));
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
