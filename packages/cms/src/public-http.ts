import type { SqlClient } from '@alshafra/database';
import { recordAnalyticsEvent } from '@alshafra/analytics';
import {
  communityStatus,
  createAnswer,
  createQuestion,
  getQuestion,
  handleCommunityApi,
  listAnswers,
  listPublicQuestions,
} from '@alshafra/community';
import { flagMap } from './flags-settings';
import { listPublicOpportunities } from './opportunities';

export interface PublicHttpInput {
  method: string;
  pathname: string;
  search: string;
  body?: unknown;
  memberId?: string | null;
}

export interface PublicHttpOutput {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}

function json(status: number, body: unknown, headers?: Record<string, string>): PublicHttpOutput {
  return { status, body, headers };
}

function mapError(err: unknown): PublicHttpOutput {
  const msg = err instanceof Error ? err.message : 'error';
  if (msg === 'community_disabled' || msg === 'not_found') return json(404, { error: msg });
  if (msg === 'unauthorized') return json(401, { error: msg });
  if (msg.includes('analytics props')) return json(400, { error: msg });
  return json(400, { error: msg });
}

export async function getPublicAds(db: SqlClient) {
  const flags = await flagMap(db);
  if (!flags.ads_enabled) return { enabled: false, client: '', slots: [] as { key: string; slotId: string }[] };
  const client = await db.query<{ value_json: unknown }>(`SELECT value_json FROM site_settings WHERE key = 'ads.client'`);
  const raw = client.rows[0]?.value_json;
  const adsClient = typeof raw === 'string' ? raw : '';
  if (!adsClient) return { enabled: false, client: '', slots: [] };
  const slots = await db.query<{ key: string; adsense_slot_id: string | null }>(
    `SELECT key, adsense_slot_id FROM ad_slots WHERE adsense_slot_id IS NOT NULL AND adsense_slot_id <> ''`,
  );
  return {
    enabled: slots.rows.length > 0,
    client: adsClient,
    slots: slots.rows.map((row) => ({ key: row.key, slotId: String(row.adsense_slot_id) })),
  };
}

export async function handlePublicApi(input: PublicHttpInput, db: SqlClient): Promise<PublicHttpOutput> {
  const method = input.method.toUpperCase();
  const path = input.pathname.replace(/\/+$/, '') || '/';
  try {
    if (method === 'POST' && path === '/api/v1/public/events') {
      const saved = await recordAnalyticsEvent(db, input.body);
      return json(202, saved);
    }
    if (method === 'GET' && path === '/api/v1/public/ads') {
      return json(200, await getPublicAds(db));
    }
    if (method === 'GET' && path === '/api/v1/public/community/status') {
      return json(200, await communityStatus(db));
    }
    if (method === 'GET' && path === '/api/v1/public/questions') {
      const status = await communityStatus(db);
      if (!status.community || !status.questions) return json(404, { error: 'community_disabled' });
      return json(200, await listPublicQuestions(db));
    }
    const q = path.match(/^\/api\/v1\/public\/questions\/([^/]+)$/);
    if (method === 'GET' && q) {
      const status = await communityStatus(db);
      if (!status.community || !status.questions) return json(404, { error: 'community_disabled' });
      const resolved = await getQuestion(db, q[1]);
      if (!resolved.question) return json(404, { error: 'not_found' });
      const answers = await listAnswers(db, resolved.question.id);
      return json(200, { question: resolved.question, answers });
    }
    if (method === 'GET' && path === '/api/v1/public/opportunities') {
      const flags = await flagMap(db);
      const items = await listPublicOpportunities(db, flags);
      if (!items.length) return json(404, { error: 'not_found' });
      return json(200, items);
    }

    if (path.startsWith('/api/v1/me/') || path.startsWith('/api/v1/public/questions')) {
      return handleCommunityApi(
        {
          method,
          pathname: path,
          search: input.search,
          body: input.body,
          memberId: input.memberId,
        },
        db,
      );
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
    if (method === 'POST' && path.match(/^\/api\/v1\/me\/questions\/[^/]+\/answers$/)) {
      if (!input.memberId) return json(401, { error: 'unauthorized' });
      const id = path.split('/')[5];
      const b = input.body as { body?: string; turnstileToken?: string };
      return json(
        201,
        await createAnswer(db, {
          userId: input.memberId,
          questionId: id,
          body: b.body || '',
          turnstileToken: b.turnstileToken,
        }),
      );
    }

    return json(404, { error: 'not_found' });
  } catch (err) {
    return mapError(err);
  }
}
