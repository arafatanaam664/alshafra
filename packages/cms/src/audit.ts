import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';
import { requirePermission, type Actor } from './permissions';

export async function writeAudit(
  db: SqlClient,
  actor: Actor | null,
  action: string,
  entityType: string,
  entityId: string | null,
  before: unknown = null,
  after: unknown = null,
): Promise<void> {
  await db.query(
    `INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, before_json, after_json)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb)`,
    [
      newId(),
      actor?.userId ?? null,
      action,
      entityType,
      entityId,
      before ? JSON.stringify(before) : null,
      after ? JSON.stringify(after) : null,
    ],
  );
}

export async function listAudit(
  db: SqlClient,
  actor: Actor | null,
  opts: { limit?: number; entityType?: string } = {},
): Promise<Record<string, unknown>[]> {
  requirePermission(actor, 'audit.read');
  const limit = Math.min(opts.limit ?? 100, 200);
  if (opts.entityType) {
    const r = await db.query(
      `SELECT id, actor_id, action, entity_type, entity_id, created_at
       FROM audit_logs WHERE entity_type = $1 ORDER BY created_at DESC LIMIT $2`,
      [opts.entityType, limit],
    );
    return r.rows;
  }
  const r = await db.query(
    `SELECT id, actor_id, action, entity_type, entity_id, created_at
     FROM audit_logs ORDER BY created_at DESC LIMIT $1`,
    [limit],
  );
  return r.rows;
}
