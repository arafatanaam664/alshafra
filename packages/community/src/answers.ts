import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';
import { requireCommunityWrite } from './flags';
import { requireMember } from './members';
import { assertAnswerLength, assertNewUserLinks } from './quality';
import { defaultRateLimiter, postLimit, type RateLimiter } from './rate-limit';
import { verifyTurnstile } from './turnstile';
import type { AnswerRecord } from './types';

export async function createAnswer(
  db: SqlClient,
  input: {
    userId: string;
    questionId: string;
    body: string;
    turnstileToken?: string;
    limiter?: RateLimiter;
  },
): Promise<AnswerRecord> {
  await requireCommunityWrite(db, 'questions');
  const member = await requireMember(db, input.userId);
  const captcha = await verifyTurnstile(input.turnstileToken);
  if (!captcha.ok) throw new Error(captcha.reason || 'turnstile_required');
  const limit = postLimit(member.isTrusted);
  const hit = await (input.limiter || defaultRateLimiter()).hit(
    `a:${member.userId}`,
    limit.limit,
    limit.windowSec,
  );
  if (!hit.ok) throw Object.assign(new Error('rate_limited'), { retryAfter: hit.retryAfter });

  const question = await db.query<{ id: string; status: string }>(
    `SELECT id, status FROM questions WHERE id = $1 AND deleted_at IS NULL`,
    [input.questionId],
  );
  if (!question.rows[0] || question.rows[0].status === 'hidden') throw new Error('not_found');

  const body = input.body.trim();
  assertAnswerLength(body);
  assertNewUserLinks(member.isNew, member.isTrusted, body);

  const id = newId();
  await db.query(
    `INSERT INTO answers (id, question_id, author_id, body, is_accepted) VALUES ($1,$2,$3,$4,false)`,
    [id, input.questionId, member.userId, body],
  );
  return { id, questionId: input.questionId, authorId: member.userId, body, isAccepted: false };
}

export async function listAnswers(db: SqlClient, questionId: string): Promise<AnswerRecord[]> {
  const rows = await db.query<{
    id: string;
    question_id: string;
    author_id: string | null;
    body: string;
    is_accepted: boolean;
  }>(
    `SELECT id, question_id, author_id, body, is_accepted FROM answers
     WHERE question_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC`,
    [questionId],
  );
  return rows.rows.map((row) => ({
    id: row.id,
    questionId: row.question_id,
    authorId: row.author_id,
    body: row.body,
    isAccepted: row.is_accepted,
  }));
}
