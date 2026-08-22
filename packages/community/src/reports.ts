import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';
import { requireMember } from './members';
import type { ModerationTarget } from './types';

export async function createReport(
  db: SqlClient,
  input: { userId: string; targetType: ModerationTarget; targetId: string; reason: string; body?: string },
) {
  const member = await requireMember(db, input.userId);
  if (!input.reason.trim()) throw new Error('reason_required');
  const id = newId();
  await db.query(
    `INSERT INTO reports (id, reporter_id, target_type, target_id, reason, body, status)
     VALUES ($1,$2,$3::moderation_target,$4,$5,$6,'open')`,
    [id, member.userId, input.targetType, input.targetId, input.reason.trim(), input.body ?? null],
  );
  return { id, status: 'open' as const };
}

export async function listOpenReports(db: SqlClient) {
  const rows = await db.query(
    `SELECT id, reporter_id, target_type::text, target_id, reason, body, status::text, created_at::text
     FROM reports ORDER BY created_at DESC LIMIT 200`,
  );
  return rows.rows;
}

export async function resolveReport(db: SqlClient, id: string, status: 'accepted' | 'rejected' | 'ignored') {
  const existing = await db.query<{ id: string }>(`SELECT id FROM reports WHERE id = $1`, [id]);
  if (!existing.rows[0]) throw new Error('not_found');
  await db.query(`UPDATE reports SET status = $2::report_status WHERE id = $1`, [id, status]);
  return { id, status };
}
