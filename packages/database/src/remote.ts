import type { SqlClient } from './sql';

type PostgresUnsafe = {
  unsafe: (
    text: string,
    params?: never[],
  ) => Promise<Array<Record<string, unknown>> & { count?: number }>;
};

async function loadPostgres(): Promise<((url: string, opts?: object) => PostgresUnsafe) | null> {
  try {
    const dynamicImport = new Function('specifier', 'return import(specifier)') as (
      specifier: string,
    ) => Promise<{ default: (url: string, opts?: object) => PostgresUnsafe }>;
    const mod = await dynamicImport('postgres');
    return typeof mod.default === 'function' ? mod.default : null;
  } catch {
    return null;
  }
}

/**
 * Optional hosted Postgres client.
 * Returns null when DATABASE_URL is missing or the `postgres` driver is not installed.
 * Admin local default remains PGlite.
 */
export async function createSqlClientFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): Promise<SqlClient | null> {
  const url = (env.DATABASE_URL || '').trim();
  if (!url) return null;
  const postgres = await loadPostgres();
  if (!postgres) return null;
  try {
    const sql = postgres(url, { max: 1, idle_timeout: 5, connect_timeout: 8 });
    return {
      async exec(text: string) {
        await sql.unsafe(text);
      },
      async query<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
        const rows = await sql.unsafe(text, params as never[]);
        const list = [...rows] as T[];
        return { rows: list, rowCount: typeof rows.count === 'number' ? rows.count : list.length };
      },
    };
  } catch {
    return null;
  }
}
