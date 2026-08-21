import type { SqlClient } from './sql';

type PgliteLike = {
  exec: (sql: string) => Promise<unknown>;
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[]; affectedRows?: number }>;
};

export function fromPglite(db: PgliteLike): SqlClient {
  return {
    async exec(sql: string) {
      await db.exec(sql);
    },
    async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []) {
      const result = await db.query(sql, params);
      const rows = (result.rows || []) as T[];
      return { rows, rowCount: result.affectedRows ?? rows.length };
    },
  };
}
