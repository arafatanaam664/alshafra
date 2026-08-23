import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlClient } from '@alshafra/database';
import { defaultSnapshotPath, refreshPublicSnapshot } from '@alshafra/content';
import { requirePermission, type Actor } from './permissions';
import { writeAudit } from './audit';

function repoRoot(): string {
  const cwd = process.cwd();
  if (existsSync(join(cwd, 'apps/web-legacy/public/published.json'))) return cwd;
  if (existsSync(join(cwd, '../../apps/web-legacy/public/published.json'))) return join(cwd, '../..');
  return cwd;
}

export function loadLegacyPaths(root = repoRoot()): Set<string> {
  const file = join(root, 'apps/web-legacy/public/published.json');
  if (!existsSync(file)) return new Set();
  const data = JSON.parse(readFileSync(file, 'utf8')) as { published: { path: string }[] };
  return new Set((data.published || []).map((row) => row.path));
}

export async function publishSite(db: SqlClient, actor: Actor) {
  requirePermission(actor, 'documents.publish');
  const root = repoRoot();
  const dest = process.env.ALSHAFRA_SNAPSHOT_PATH || defaultSnapshotPath(root);
  const result = await refreshPublicSnapshot(db, dest, loadLegacyPaths(root));
  await db.query(
    `INSERT INTO site_settings (key, value_json, updated_by) VALUES ('site.last_publish',$1::jsonb,$2)
     ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_by = EXCLUDED.updated_by`,
    [JSON.stringify({ at: new Date().toISOString(), dest: result.dest, routes: result.routes, counts: result.counts }), actor.userId],
  );
  await writeAudit(db, actor, 'site.publish', 'snapshot', null, null, { dest: result.dest, routes: result.routes });
  return { ...result, note: 'اللقطة جاهزة. يظهر التغيير للزائر بعد بناء الموقع.' };
}

export async function getSitePublishStatus(db: SqlClient, actor: Actor | null) {
  if (!actor) requirePermission(actor, 'documents.read');
  const row = await db.query<{ value_json: unknown }>(`SELECT value_json FROM site_settings WHERE key = 'site.last_publish'`);
  return { last: row.rows[0]?.value_json ?? null };
}
