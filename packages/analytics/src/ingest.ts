import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';
import {
  analyticsEventContract,
  assertAnalyticsPrivacy,
  isAllowedEvent,
  type AnalyticsEvent,
} from './contract';

export async function recordAnalyticsEvent(db: SqlClient, raw: unknown): Promise<{ id: string; accepted: true }> {
  const event = analyticsEventContract.parse(raw);
  if (!isAllowedEvent(event.name)) throw new Error('unknown_event');
  assertAnalyticsPrivacy(event);
  const id = newId();
  const occurred = event.occurredAt || new Date().toISOString();
  await db.query(
    `INSERT INTO analytics_events (id, name, path, document_id, tool_id, props_json, occurred_at, session_hash)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8)`,
    [
      id,
      event.name,
      event.path ?? null,
      event.documentId ?? null,
      event.toolId ?? null,
      JSON.stringify(event.props ?? {}),
      occurred,
      event.sessionHash ?? null,
    ],
  );

  if (event.name === 'page_view' || event.name === 'content_view' || event.name === 'article_view') {
    if (event.path) {
      const day = occurred.slice(0, 10);
      await db.query(
        `INSERT INTO page_view_daily (day, path, views, unique_sessions)
         VALUES ($1::date,$2,1,1)
         ON CONFLICT (day, path) DO UPDATE SET views = page_view_daily.views + 1`,
        [day, event.path],
      );
    }
    if (event.documentId) {
      await db.query(
        `INSERT INTO content_metrics (document_id, views) VALUES ($1,1)
         ON CONFLICT (document_id) DO UPDATE SET views = content_metrics.views + 1`,
        [event.documentId],
      );
    }
  }

  if (event.name === 'tool_used' && event.toolId) {
    await db.query(
      `INSERT INTO tool_metrics (tool_id, uses) VALUES ($1,1)
       ON CONFLICT (tool_id) DO UPDATE SET uses = tool_metrics.uses + 1`,
      [event.toolId],
    );
  }

  if (event.name === 'share' && event.documentId) {
    await db.query(
      `INSERT INTO content_metrics (document_id, shares) VALUES ($1,1)
       ON CONFLICT (document_id) DO UPDATE SET shares = content_metrics.shares + 1`,
      [event.documentId],
    );
  }

  return { id, accepted: true };
}

export async function analyticsHasData(db: SqlClient): Promise<boolean> {
  const row = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM analytics_events`);
  return (row.rows[0]?.n ?? 0) > 0;
}

export type { AnalyticsEvent };
