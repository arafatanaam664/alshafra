import type { SqlClient } from '@alshafra/database';
import { communityStatus } from './flags';
import { createQuestion, getQuestion, listQuestions } from './questions';
import { createAnswer } from './answers';
import { castVote } from './votes';
import { createReport, listOpenReports, resolveReport } from './reports';
import { hideQuestion, restoreQuestion } from './moderate';
import type { VoteTarget } from './types';

export interface CommunityHttpInput {
  method: string;
  pathname: string;
  search: string;
  body?: unknown;
  memberId?: string | null;
}

export interface CommunityHttpOutput {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}

function json(status: number, body: unknown, headers?: Record<string, string>): CommunityHttpOutput {
  return { status, body, headers };
}

function mapError(err: unknown): CommunityHttpOutput {
  const msg = err instanceof Error ? err.message : 'error';
  if (msg === 'community_disabled' || msg === 'not_found') return json(404, { error: msg });
  if (msg === 'unauthorized') return json(401, { error: msg });
  if (msg === 'rate_limited') {
    const retry = err instanceof Error && 'retryAfter' in err ? String((err as { retryAfter?: number }).retryAfter || 60) : '60';
    return json(429, { error: msg }, { 'retry-after': retry });
  }
  if (msg === 'duplicate_question') {
    const path = err instanceof Error && 'existingPath' in err ? (err as { existingPath?: string }).existingPath : undefined;
    return json(409, { error: msg, existingPath: path });
  }
  return json(400, { error: msg });
}

export async function handleCommunityApi(input: CommunityHttpInput, db: SqlClient): Promise<CommunityHttpOutput> {
  const method = input.method.toUpperCase();
  const path = input.pathname.replace(/\/+$/, '') || '/';
  try {
    if (method === 'GET' && path === '/api/v1/public/community/status') {
      return json(200, await communityStatus(db));
    }

    const publicQ = path.match(/^\/api\/v1\/public\/questions\/([^/]+)$/);
    if (method === 'GET' && publicQ) {
      const resolved = await getQuestion(db, publicQ[1]);
      if (!resolved.question) return json(404, { error: 'not_found' });
      return json(200, resolved.question);
    }

    if (method === 'POST' && path === '/api/v1/me/questions') {
      if (!input.memberId) return json(401, { error: 'unauthorized' });
      const b = input.body as { title?: string; body?: string; turnstileToken?: string };
      const created = await createQuestion(db, {
        userId: input.memberId,
        title: b.title || '',
        body: b.body || '',
        turnstileToken: b.turnstileToken,
      });
      return json(201, created);
    }

    const answerMatch = path.match(/^\/api\/v1\/me\/questions\/([^/]+)\/answers$/);
    if (method === 'POST' && answerMatch) {
      if (!input.memberId) return json(401, { error: 'unauthorized' });
      const b = input.body as { body?: string; turnstileToken?: string };
      const created = await createAnswer(db, {
        userId: input.memberId,
        questionId: answerMatch[1],
        body: b.body || '',
        turnstileToken: b.turnstileToken,
      });
      return json(201, created);
    }

    if (method === 'POST' && path === '/api/v1/me/votes') {
      if (!input.memberId) return json(401, { error: 'unauthorized' });
      const b = input.body as { targetType?: VoteTarget; targetId?: string; value?: number };
      const vote = await castVote(db, {
        userId: input.memberId,
        targetType: b.targetType || 'question',
        targetId: b.targetId || '',
        value: b.value === -1 ? -1 : 1,
      });
      return json(200, vote);
    }

    if (method === 'POST' && path === '/api/v1/me/reports') {
      if (!input.memberId) return json(401, { error: 'unauthorized' });
      const b = input.body as { targetType?: 'question'; targetId?: string; reason?: string; body?: string };
      const report = await createReport(db, {
        userId: input.memberId,
        targetType: b.targetType || 'question',
        targetId: b.targetId || '',
        reason: b.reason || '',
        body: b.body,
      });
      return json(201, report);
    }

    return json(404, { error: 'not_found' });
  } catch (err) {
    return mapError(err);
  }
}

export async function handleModerationApi(
  input: CommunityHttpInput & { actorId: string },
  db: SqlClient,
): Promise<CommunityHttpOutput> {
  const method = input.method.toUpperCase();
  const path = input.pathname.replace(/\/+$/, '') || '/';
  try {
    if (method === 'GET' && path === '/api/v1/admin/community/status') {
      return json(200, await communityStatus(db));
    }
    if (method === 'GET' && path === '/api/v1/admin/community/questions') {
      return json(200, await listQuestions(db));
    }
    if (method === 'GET' && path === '/api/v1/admin/community/reports') {
      return json(200, await listOpenReports(db));
    }
    const hide = path.match(/^\/api\/v1\/admin\/community\/questions\/([^/]+)\/hide$/);
    if (method === 'POST' && hide) {
      return json(200, await hideQuestion(db, input.actorId, hide[1], (input.body as { reason?: string })?.reason));
    }
    const restore = path.match(/^\/api\/v1\/admin\/community\/questions\/([^/]+)\/restore$/);
    if (method === 'POST' && restore) {
      return json(200, await restoreQuestion(db, input.actorId, restore[1], (input.body as { reason?: string })?.reason));
    }
    const resolve = path.match(/^\/api\/v1\/admin\/community\/reports\/([^/]+)\/resolve$/);
    if (method === 'POST' && resolve) {
      const status = (input.body as { status?: 'accepted' | 'rejected' | 'ignored' })?.status || 'ignored';
      return json(200, await resolveReport(db, resolve[1], status));
    }
    return json(404, { error: 'not_found' });
  } catch (err) {
    return mapError(err);
  }
}
