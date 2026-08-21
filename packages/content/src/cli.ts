import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyMigrations, fromPglite, seedDatabase } from '@alshafra/database';
import { collectParity, importLegacyContent } from './legacy-import';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../../..');
const dataDir = join(repoRoot, 'packages/database/data');

async function main() {
  const { PGlite } = await import('@electric-sql/pglite');
  mkdirSync(dataDir, { recursive: true });
  const db = new PGlite(join(dataDir, 'local'));
  const client = fromPglite(db);
  const applied = await applyMigrations(client);
  const seeded = await seedDatabase(client);
  const first = await importLegacyContent(client, repoRoot);
  const second = await importLegacyContent(client, repoRoot);
  const parity = await collectParity(client, repoRoot);
  writeFileSync(join(dataDir, 'content-snapshot.json'), JSON.stringify(first.snapshot, null, 2));
  console.log(
    JSON.stringify(
      {
        migrations: applied.length,
        seed: seeded,
        first: first.counts,
        second: second.counts,
        parity,
        snapshotRoutes: first.snapshot.routes.length,
      },
      null,
      2,
    ),
  );
  if (parity.published !== 127 || parity.missing.length || parity.mismatches.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
