import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlClient } from '@alshafra/database';
import { defaultSnapshotPath, refreshPublicSnapshot } from '@alshafra/content';
import { hasPermission, requirePermission, type Actor } from './permissions';
import { writeAudit } from './audit';
import { publishHonestyNote, triggerProductionDeploy, uploadPublicSnapshot } from './deploy';

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

export interface PublishSiteOptions {
  triggerDeploy?: boolean;
}

export async function publishSite(db: SqlClient, actor: Actor, options: PublishSiteOptions = {}) {
  requirePermission(actor, 'documents.publish');
  const root = repoRoot();
  const dest = process.env.ALSHAFRA_SNAPSHOT_PATH || defaultSnapshotPath(root);
  const result = await refreshPublicSnapshot(db, dest, loadLegacyPaths(root));

  let snapshotBody = '';
  try {
    snapshotBody = readFileSync(result.dest, 'utf8');
  } catch {
    snapshotBody = '';
  }

  const upload = snapshotBody ? await uploadPublicSnapshot(snapshotBody) : { status: 'not_configured' as const };
  const deploy =
    options.triggerDeploy === true ? await triggerProductionDeploy() : { status: 'not_configured' as const };
  const honesty = publishHonestyNote({ upload: upload.status, deploy: deploy.status });

  const record = {
    at: new Date().toISOString(),
    dest: result.dest,
    routes: result.routes,
    counts: result.counts,
    stages: {
      save: 'separate',
      publish: 'separate',
      snapshot: 'written',
      upload: upload.status,
      deploy: deploy.status,
    },
    live: honesty.live,
    note: honesty.note,
  };

  await db.query(
    `INSERT INTO site_settings (key, value_json, updated_by) VALUES ('site.last_publish',$1::jsonb,$2)
     ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_by = EXCLUDED.updated_by`,
    [JSON.stringify(record), actor.userId],
  );
  await writeAudit(db, actor, 'site.publish', 'snapshot', null, null, {
    dest: result.dest,
    routes: result.routes,
    upload: upload.status,
    deploy: deploy.status,
    live: honesty.live,
  });
  return { ...result, ...record };
}

export async function getSitePublishStatus(db: SqlClient, actor: Actor | null) {
  if (!hasPermission(actor, 'documents.read') && !hasPermission(actor, 'documents.publish')) {
    requirePermission(actor, 'documents.read');
  }
  const row = await db.query<{ value_json: unknown }>(`SELECT value_json FROM site_settings WHERE key = 'site.last_publish'`);
  return {
    last: row.rows[0]?.value_json ?? null,
    stages: {
      save: 'draft persist — does not change the public site',
      publish: 'document status published — snapshot is best-effort',
      deploy: 'explicit site-publish with triggerDeploy — may start a host build',
    },
  };
}
