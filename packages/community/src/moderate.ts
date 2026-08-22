import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';

export async function hideQuestion(db: SqlClient, actorId: string, questionId: string, reason?: string) {
  const row = await db.query<{ status: string }>(`SELECT status FROM questions WHERE id = $1 AND deleted_at IS NULL`, [
    questionId,
  ]);
  if (!row.rows[0]) throw new Error('not_found');
  await db.query(`UPDATE questions SET status = 'hidden', indexable = false WHERE id = $1`, [questionId]);
  await db.query(
    `INSERT INTO moderation_actions (id, actor_id, target_type, target_id, action, reason)
     VALUES ($1,$2,'question',$3,'hide',$4)`,
    [newId(), actorId, questionId, reason ?? null],
  );
  return { id: questionId, status: 'hidden' as const };
}

export async function restoreQuestion(db: SqlClient, actorId: string, questionId: string, reason?: string) {
  const row = await db.query<{ status: string }>(`SELECT status FROM questions WHERE id = $1 AND deleted_at IS NULL`, [
    questionId,
  ]);
  if (!row.rows[0]) throw new Error('not_found');
  await db.query(`UPDATE questions SET status = 'open', indexable = false WHERE id = $1`, [questionId]);
  await db.query(
    `INSERT INTO moderation_actions (id, actor_id, target_type, target_id, action, reason)
     VALUES ($1,$2,'question',$3,'restore',$4)`,
    [newId(), actorId, questionId, reason ?? null],
  );
  return { id: questionId, status: 'open' as const, indexable: false };
}
