import type { SqlClient } from '@alshafra/database';
import { mediaStatus } from '@alshafra/media';
import { requirePermission, type Actor } from './permissions';

export async function getDashboardOverview(db: SqlClient, actor: Actor | null) {
  requirePermission(actor, 'documents.read');
  const [statuses, routes, tools, views, events, audits, flags, missingSeo, topPages, topTools, searches, drafts] =
    await Promise.all([
      db.query<{ status: string; n: number }>(
        `SELECT status::text AS status, count(*)::int AS n FROM documents WHERE deleted_at IS NULL GROUP BY status`,
      ),
      db.query<{ n: number }>(`SELECT count(*)::int AS n FROM routes WHERE status = 'active'`),
      db.query<{ n: number }>(`SELECT count(*)::int AS n FROM tools`),
      db.query<{ s: number }>(`SELECT coalesce(sum(views),0)::int AS s FROM content_metrics`),
      db.query<{ n: number }>(`SELECT count(*)::int AS n FROM analytics_events`),
      db.query<{ n: number }>(`SELECT count(*)::int AS n FROM audit_logs`),
      db.query<{ n: number }>(`SELECT count(*)::int AS n FROM feature_flags WHERE is_enabled = true`),
      db.query<{ n: number }>(
        `SELECT count(*)::int AS n FROM documents d
         LEFT JOIN document_seo s ON s.document_id = d.id
         WHERE d.deleted_at IS NULL AND d.status = 'published'
           AND (s.seo_title IS NULL OR s.meta_description IS NULL OR length(coalesce(s.meta_description,'')) < 20)`,
      ),
      db.query<{ path: string; title: string; views: number }>(
        `SELECT d.path, d.title, coalesce(m.views,0)::int AS views
         FROM documents d
         LEFT JOIN content_metrics m ON m.document_id = d.id
         WHERE d.deleted_at IS NULL
         ORDER BY coalesce(m.views,0) DESC, d.updated_at DESC
         LIMIT 8`,
      ),
      db.query<{ key: string; name: string; uses: number }>(
        `SELECT t.key, t.name, coalesce(m.uses,0)::int AS uses
         FROM tools t LEFT JOIN tool_metrics m ON m.tool_id = t.id
         ORDER BY coalesce(m.uses,0) DESC LIMIT 8`,
      ),
      db.query<{ n: number }>(`SELECT count(*)::int AS n FROM search_queries`),
      db.query<{ n: number }>(`SELECT count(*)::int AS n FROM documents WHERE status = 'draft' AND deleted_at IS NULL`),
    ]);

  const byStatus: Record<string, number> = {};
  for (const row of statuses.rows) byStatus[row.status] = row.n;
  const totalViews = views.rows[0]?.s ?? 0;
  const eventCount = events.rows[0]?.n ?? 0;

  return {
    content: {
      published: byStatus.published ?? 0,
      draft: byStatus.draft ?? 0,
      review: byStatus.review ?? 0,
      scheduled: byStatus.scheduled ?? 0,
      archived: byStatus.archived ?? 0,
      unpublished: byStatus.unpublished ?? 0,
      total: Object.values(byStatus).reduce((a, b) => a + b, 0),
    },
    traffic: {
      pageViews: totalViews,
      uniqueVisitors: null as number | null,
      sessions: null as number | null,
      events: eventCount,
      hasData: totalViews > 0 || eventCount > 0,
    },
    system: {
      routes: routes.rows[0]?.n ?? 0,
      tools: tools.rows[0]?.n ?? 0,
      flagsOn: flags.rows[0]?.n ?? 0,
      audit: audits.rows[0]?.n ?? 0,
      missingSeo: missingSeo.rows[0]?.n ?? 0,
      searches: searches.rows[0]?.n ?? 0,
      drafts: drafts.rows[0]?.n ?? 0,
    },
    topPages: topPages.rows,
    topTools: topTools.rows,
  };
}

export async function getSystemHealth(db: SqlClient, actor: Actor | null, expectedRoutes = 127) {
  requirePermission(actor, 'health.read');
  await db.query('SELECT 1 AS ok');
  const routes = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM routes WHERE status = 'active'`);
  const docs = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM documents WHERE deleted_at IS NULL`);
  const seo = await db.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM document_seo s
     JOIN documents d ON d.id = s.document_id
     WHERE d.deleted_at IS NULL AND s.canonical_url IS NOT NULL AND s.seo_title IS NOT NULL`,
  );
  const events = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM analytics_events`);
  const nRoutes = routes.rows[0]?.n ?? 0;
  const nSeo = seo.rows[0]?.n ?? 0;
  const nDocs = docs.rows[0]?.n ?? 0;
  return {
    database: 'healthy' as const,
    content: nDocs > 0 ? 'healthy' : 'empty',
    routes: { count: nRoutes, expected: expectedRoutes, label: `${nRoutes}/${expectedRoutes}` },
    seo: { count: nSeo, of: nDocs, label: `${nSeo}/${nDocs}` },
    media: mediaStatus(),
    analytics: (events.rows[0]?.n ?? 0) > 0 ? 'receiving' : 'no_data',
  };
}
