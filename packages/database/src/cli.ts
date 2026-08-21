/**
 * npm run data:migrate | data:seed
 * Uses PGlite when DATABASE_URL is empty. Never prints secrets.
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyMigrations } from './migrate';
import { seedDatabase } from './seed';
import { fromPglite } from './pglite';
import { hasRemoteDatabase, readDatabaseEnv } from './client';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '../data');

async function openClient() {
  const env = readDatabaseEnv();
  if (hasRemoteDatabase(env) && env.DATABASE_URL) {
    throw new Error(
      'Direct postgres.js driver is not bundled in Phase 4. Use PGlite locally or apply SQL via Supabase CLI. DATABASE_URL was set — refusing to guess a production connection.',
    );
  }
  const { PGlite } = await import('@electric-sql/pglite');
  mkdirSync(dataDir, { recursive: true });
  const db = new PGlite(join(dataDir, 'local'));
  return { client: fromPglite(db), kind: 'pglite' as const };
}

async function main() {
  const cmd = process.argv[2] || 'help';
  if (cmd === 'help' || cmd === '--help') {
    console.log('Usage: tsx packages/database/src/cli.ts [migrate|seed]');
    return;
  }
  const { client, kind } = await openClient();
  if (cmd === 'migrate') {
    const applied = await applyMigrations(client);
    console.log(`Migrations applied (${kind}): ${applied.length ? applied.join(', ') : 'none (already up to date)'}`);
    return;
  }
  if (cmd === 'seed') {
    await applyMigrations(client);
    const result = await seedDatabase(client);
    console.log(`Seed ok (${kind}): roles=${result.roles} flags=${result.flags} redirects=${result.redirects}`);
    return;
  }
  throw new Error(`Unknown command ${cmd}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
