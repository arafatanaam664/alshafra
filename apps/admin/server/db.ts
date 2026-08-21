import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyMigrations, fromPglite, seedDatabase, type SqlClient } from '@alshafra/database';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const dataDir = join(root, 'packages/database/data');

let cached: SqlClient | null = null;

export async function getAdminDb(): Promise<SqlClient> {
  if (cached) return cached;
  const { PGlite } = await import('@electric-sql/pglite');
  mkdirSync(dataDir, { recursive: true });
  const db = new PGlite(join(dataDir, 'local'));
  const client = fromPglite(db);
  await applyMigrations(client);
  await seedDatabase(client);
  cached = client;
  return client;
}
