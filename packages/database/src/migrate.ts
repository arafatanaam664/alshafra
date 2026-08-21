import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SqlClient } from './sql';

const here = dirname(fileURLToPath(import.meta.url));
export const MIGRATIONS_DIR = join(here, '../migrations');

export function listMigrationFiles(dir = MIGRATIONS_DIR): { version: string; file: string; sql: string }[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => ({
      version: name.replace(/\.sql$/, ''),
      file: join(dir, name),
      sql: readFileSync(join(dir, name), 'utf8'),
    }));
}

export async function applyMigrations(client: SqlClient, dir = MIGRATIONS_DIR): Promise<string[]> {
  const applied: string[] = [];
  await client.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const done = new Set(
    (await client.query<{ version: string }>('SELECT version FROM schema_migrations')).rows.map((r) => r.version),
  );

  for (const mig of listMigrationFiles(dir)) {
    if (done.has(mig.version)) continue;
    await client.exec(mig.sql);
    await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [mig.version]);
    applied.push(mig.version);
  }
  return applied;
}
