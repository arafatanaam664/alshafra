import { newId } from '@alshafra/kernel';
import { normalizeArabic } from '@alshafra/search';
import type { SqlClient } from '@alshafra/database';
import { requireCommunityWrite, flagEnabled } from './flags';
import { questionPath, reservedCommunityPath } from './paths';
import { assertNewUserLinks, assertPostLength, evaluateUgcIndexable, ugcRobots } from './quality';
import { defaultRateLimiter, postLimit, type RateLimiter } from './rate-limit';
import { verifyTurnstile } from './turnstile';
import { requireMember } from './members';
import type { QuestionRecord } from './types';

function mapQuestion(row: {
  id: string;
  author_id: string | null;
  title: string;
  slug: string;
  path: string;
  body: string;
  status: string;
  indexable: boolean;
  created_at?: string;
}): QuestionRecord {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    slug: row.slug,
    path: row.path,
    body: row.body,
    status: row.status as QuestionRecord['status'],
    indexable: Boolean(row.indexable),
    robots: ugcRobots(),
    createdAt: row.created_at,
  };
}

export async function findDuplicateQuestion(db: SqlClient, title: string): Promise<QuestionRecord | null> {
  const needle = normalizeArabic(title).toLowerCase();
  const rows = await db.query<{
    id: string;
    author_id: string | null;
    title: string;
    slug: string;
    path: string;
    body: string;
    status: string;
    indexable: boolean;
  }>(
    `SELECT id, author_id, title, slug, path, body, status, indexable
     FROM questions WHERE deleted_at IS NULL AND status <> 'hidden'`,
  );
  const hit = rows.rows.find((row) => normalizeArabic(row.title).toLowerCase() === needle);
  return hit ? mapQuestion(hit) : null;
}

export async function createQuestion(
  db: SqlClient,
  input: {
    userId: string;
    title: string;
    body: string;
    turnstileToken?: string;
    ip?: string;
    limiter?: RateLimiter;
  },
): Promise<QuestionRecord> {
  await requireCommunityWrite(db, 'questions');
  const member = await requireMember(db, input.userId);
  const captcha = await verifyTurnstile(input.turnstileToken);
  if (!captcha.ok) throw new Error(captcha.reason || 'turnstile_required');
  const limit = postLimit(member.isTrusted);
  const hit = await (input.limiter || defaultRateLimiter()).hit(
    `q:${member.userId}`,
    limit.limit,
    limit.windowSec,
  );
  if (!hit.ok) throw Object.assign(new Error('rate_limited'), { retryAfter: hit.retryAfter });

  const title = input.title.trim();
  const body = input.body.trim();
  assertPostLength(title, body);
  assertNewUserLinks(member.isNew, member.isTrusted, `${title}\n${body}`);
  const dup = await findDuplicateQuestion(db, title);
  if (dup) throw Object.assign(new Error('duplicate_question'), { existingPath: dup.path });

  const id = newId();
  const slug = title;
  const path = questionPath(id, slug);
  if (reservedCommunityPath(path)) throw new Error('reserved_path');

  const ugcAutoIndex = await flagEnabled(db, 'seo.ugc_auto_index');
  const indexable = evaluateUgcIndexable({
    ugcAutoIndex,
    status: 'open',
    title,
    body,
    answerCount: 0,
    hidden: false,
  });

  await db.query(
    `INSERT INTO questions (id, author_id, title, slug, path, body, status, indexable)
     VALUES ($1,$2,$3,$4,$5,$6,'open',$7)`,
    [id, member.userId, title, path.split('/').pop(), path, body, indexable],
  );
  return {
    id,
    authorId: member.userId,
    title,
    slug: path.split('/').pop() || id,
    path,
    body,
    status: 'open',
    indexable,
    robots: ugcRobots(),
  };
}

export async function getQuestion(db: SqlClient, id: string, requestedSlug?: string) {
  const row = await db.query<{
    id: string;
    author_id: string | null;
    title: string;
    slug: string;
    path: string;
    body: string;
    status: string;
    indexable: boolean;
    created_at: string;
  }>(
    `SELECT id, author_id, title, slug, path, body, status, indexable, created_at::text
     FROM questions WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  const found = row.rows[0];
  if (!found || found.status === 'hidden') return { question: null as QuestionRecord | null, redirect: null as string | null };
  const question = mapQuestion(found);
  if (requestedSlug && requestedSlug !== question.slug) return { question, redirect: question.path };
  return { question, redirect: null };
}

export async function listPublicQuestions(db: SqlClient, limit = 50) {
  const rows = await db.query<{
    id: string;
    author_id: string | null;
    title: string;
    slug: string;
    path: string;
    body: string;
    status: string;
    indexable: boolean;
    created_at: string;
  }>(
    `SELECT id, author_id, title, slug, path, body, status, indexable, created_at::text
     FROM questions
     WHERE deleted_at IS NULL AND status <> 'hidden'
     ORDER BY created_at DESC
     LIMIT $1`,
    [Math.min(limit, 200)],
  );
  return rows.rows.map(mapQuestion);
}

export async function listQuestions(db: SqlClient, limit = 50) {
  const rows = await db.query<{
    id: string;
    author_id: string | null;
    title: string;
    slug: string;
    path: string;
    body: string;
    status: string;
    indexable: boolean;
    created_at: string;
  }>(
    `SELECT id, author_id, title, slug, path, body, status, indexable, created_at::text
     FROM questions WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1`,
    [Math.min(limit, 200)],
  );
  return rows.rows.map(mapQuestion);
}
