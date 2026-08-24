/**
 * Public analytics ingest for the static Astro host.
 * Beacon posts here. Rejects PII. Stores only when DATABASE_URL + driver exist.
 */
const ALLOWED = new Set([
  'page_view',
  'content_view',
  'article_view',
  'tool_used',
  'search',
  'share',
  'copy_link',
]);

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

function privacyError(props) {
  const blob = JSON.stringify(props ?? {});
  if (/"ip"/i.test(blob) || /password/i.test(blob) || /email/i.test(blob)) {
    return 'analytics props must not include ip, password, or email';
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    send(res, 405, { error: 'method_not_allowed' });
    return;
  }

  const event = req.body && typeof req.body === 'object' ? req.body : {};
  if (!ALLOWED.has(event.name)) {
    send(res, 400, { error: 'unknown_event' });
    return;
  }
  const blocked = privacyError(event.props);
  if (blocked) {
    send(res, 400, { error: blocked });
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    send(res, 202, { accepted: true, stored: false });
    return;
  }

  try {
    const { recordAnalyticsEvent } = await import('../../../packages/analytics/src/ingest.ts');
    const { createSqlClientFromEnv } = await import('../../../packages/database/src/remote.ts');
    const db = await createSqlClientFromEnv();
    if (!db) {
      send(res, 202, { accepted: true, stored: false });
      return;
    }
    const saved = await recordAnalyticsEvent(db, event);
    send(res, 202, { ...saved, stored: true });
  } catch {
    send(res, 202, { accepted: true, stored: false });
  }
}
