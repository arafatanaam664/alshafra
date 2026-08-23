import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';
import type { NotificationType } from './index';

export async function createNotification(
  db: SqlClient,
  input: {
    recipientId: string;
    type: NotificationType | string;
    actorId?: string | null;
    entityType?: string;
    entityId?: string;
    payload?: Record<string, unknown>;
  },
) {
  const id = newId();
  await db.query(
    `INSERT INTO notifications (id, recipient_id, type, actor_id, entity_type, entity_id, payload_json)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
    [
      id,
      input.recipientId,
      input.type,
      input.actorId ?? null,
      input.entityType ?? null,
      input.entityId ?? null,
      JSON.stringify(input.payload ?? {}),
    ],
  );
  return { id };
}

export async function listNotifications(db: SqlClient, recipientId?: string, limit = 50) {
  const rows = await db.query<{
    id: string;
    recipient_id: string;
    type: string;
    entity_type: string | null;
    entity_id: string | null;
    payload_json: unknown;
    read_at: string | null;
    created_at: string;
  }>(
    `SELECT id, recipient_id, type, entity_type, entity_id, payload_json, read_at::text, created_at::text
     FROM notifications
     WHERE ($1::uuid IS NULL OR recipient_id = $1)
     ORDER BY created_at DESC
     LIMIT $2`,
    [recipientId ?? null, Math.min(limit, 200)],
  );
  return rows.rows;
}

export async function markNotificationRead(db: SqlClient, id: string, recipientId: string) {
  await db.query(`UPDATE notifications SET read_at = now() WHERE id = $1 AND recipient_id = $2 AND read_at IS NULL`, [
    id,
    recipientId,
  ]);
  return { id, read: true };
}
