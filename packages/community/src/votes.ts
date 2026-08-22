import type { SqlClient } from '@alshafra/database';
import { requireCommunityWrite } from './flags';
import { requireMember } from './members';
import { defaultRateLimiter, voteLimit, type RateLimiter } from './rate-limit';
import type { VoteTarget } from './types';

export async function castVote(
  db: SqlClient,
  input: {
    userId: string;
    targetType: VoteTarget;
    targetId: string;
    value: 1 | -1;
    limiter?: RateLimiter;
  },
): Promise<{ value: number; reused: boolean }> {
  await requireCommunityWrite(db, 'questions');
  const member = await requireMember(db, input.userId);
  const limit = voteLimit();
  const hit = await (input.limiter || defaultRateLimiter()).hit(
    `v:${member.userId}`,
    limit.limit,
    limit.windowSec,
  );
  if (!hit.ok) throw Object.assign(new Error('rate_limited'), { retryAfter: hit.retryAfter });
  if (input.value !== 1 && input.value !== -1) throw new Error('invalid_vote');

  const existing = await db.query<{ value: number }>(
    `SELECT value FROM votes WHERE user_id = $1 AND target_type = $2::vote_target AND target_id = $3`,
    [member.userId, input.targetType, input.targetId],
  );
  if (existing.rows[0]?.value === input.value) return { value: input.value, reused: true };

  await db.query(
    `INSERT INTO votes (user_id, target_type, target_id, value)
     VALUES ($1,$2::vote_target,$3,$4)
     ON CONFLICT (user_id, target_type, target_id) DO UPDATE SET value = EXCLUDED.value`,
    [member.userId, input.targetType, input.targetId, input.value],
  );
  return { value: input.value, reused: Boolean(existing.rows[0]) };
}
