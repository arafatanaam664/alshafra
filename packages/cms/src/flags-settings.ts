import type { SqlClient } from '@alshafra/database';
import { writeAudit } from './audit';
import { requirePermission, type Actor } from './permissions';

export async function listFlags(db: SqlClient, actor: Actor | null) {
  requirePermission(actor, 'flags.read');
  return (
    await db.query(
      `SELECT key, is_enabled, description, environment, rollout_percent, updated_at FROM feature_flags ORDER BY key`,
    )
  ).rows;
}

export async function setFlag(db: SqlClient, actor: Actor, key: string, enabled: boolean) {
  requirePermission(actor, 'flags.toggle');
  const prev = await db.query<{ is_enabled: boolean }>(`SELECT is_enabled FROM feature_flags WHERE key = $1`, [key]);
  if (!prev.rows[0]) throw new Error('not_found');
  await db.query(`UPDATE feature_flags SET is_enabled = $2 WHERE key = $1`, [key, enabled]);
  await writeAudit(db, actor, 'flags.toggle', 'feature_flag', null, { key, enabled: prev.rows[0].is_enabled }, { key, enabled });
}

export async function listSettings(db: SqlClient, actor: Actor | null) {
  requirePermission(actor, 'settings.read');
  return (await db.query(`SELECT key, value_json, updated_at FROM site_settings ORDER BY key`)).rows;
}

export async function setSetting(db: SqlClient, actor: Actor, key: string, value: unknown) {
  requirePermission(actor, 'settings.write');
  if (/secret|password|token|service_role|private_key/i.test(key)) {
    throw new Error('secret_key_forbidden');
  }
  await db.query(
    `INSERT INTO site_settings (key, value_json, updated_by) VALUES ($1,$2::jsonb,$3)
     ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_by = EXCLUDED.updated_by`,
    [key, JSON.stringify(value), actor.userId],
  );
  await writeAudit(db, actor, 'settings.write', 'site_setting', null, null, { key });
}

export async function listRedirects(db: SqlClient, actor: Actor | null) {
  requirePermission(actor, 'seo.redirects_manage');
  return (
    await db.query(
      `SELECT id, source_pattern, destination, status_code, reason, is_enabled FROM redirects ORDER BY source_pattern`,
    )
  ).rows;
}

export async function listMedia(db: SqlClient, actor: Actor | null) {
  requirePermission(actor, 'media.read');
  return (
    await db.query(
      `SELECT id, object_key, mime, byte_size, width, height, alt, visibility::text, created_at
       FROM media WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 200`,
    )
  ).rows;
}

export async function listTools(db: SqlClient, actor: Actor | null) {
  requirePermission(actor, 'documents.read');
  return (
    await db.query(
      `SELECT t.id, t.key, t.path, t.name, t.status, t.runtime::text, t.data_mode::text,
              coalesce(m.uses,0)::int AS uses
       FROM tools t LEFT JOIN tool_metrics m ON m.tool_id = t.id ORDER BY t.path`,
    )
  ).rows;
}

export async function listUsers(db: SqlClient, actor: Actor | null) {
  requirePermission(actor, 'users.read');
  return (
    await db.query(
      `SELECT u.id, u.email, u.display_name, u.status::text, u.created_at,
              coalesce(array_agg(r.key) FILTER (WHERE r.key IS NOT NULL), '{}') AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       WHERE u.deleted_at IS NULL
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
    )
  ).rows;
}

export async function getAnalyticsOverview(db: SqlClient, actor: Actor | null) {
  requirePermission(actor, 'analytics.read');
  const events = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM analytics_events`);
  const searches = await db.query(
    `SELECT query_normalized, hit_count FROM popular_searches ORDER BY hit_count DESC LIMIT 20`,
  );
  const zero = await db.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM search_queries WHERE result_count = 0`,
  );
  const pages = await db.query(
    `SELECT d.path, d.title, coalesce(m.views,0)::int AS views, coalesce(m.shares,0)::int AS shares
     FROM documents d LEFT JOIN content_metrics m ON m.document_id = d.id
     WHERE d.deleted_at IS NULL ORDER BY coalesce(m.views,0) DESC LIMIT 20`,
  );
  const tools = await db.query(
    `SELECT t.key, t.path, coalesce(m.uses,0)::int AS uses FROM tools t
     LEFT JOIN tool_metrics m ON m.tool_id = t.id ORDER BY coalesce(m.uses,0) DESC LIMIT 20`,
  );
  const n = events.rows[0]?.n ?? 0;
  return {
    hasData: n > 0,
    events: n,
    searches: searches.rows,
    zeroResultSearches: zero.rows[0]?.n ?? 0,
    pages: pages.rows,
    tools: tools.rows,
    social: { hasData: false },
  };
}

export async function getDocumentAnalytics(db: SqlClient, actor: Actor | null, documentId: string) {
  requirePermission(actor, 'analytics.read');
  const m = await db.query(
    `SELECT views, unique_views, shares, comments, bookmarks, search_impressions, search_clicks, social_clicks
     FROM content_metrics WHERE document_id = $1`,
    [documentId],
  );
  const row = m.rows[0] as
    | {
        views: number;
        unique_views: number;
        shares: number;
        comments: number;
        bookmarks: number;
        search_impressions: number;
        search_clicks: number;
        social_clicks: number;
      }
    | undefined;
  const hasData = Boolean(row && Object.values(row).some((v) => Number(v) > 0));
  return { hasData, metrics: row ?? null };
}
