import type { SqlClient } from '@alshafra/database';
import { processSocialJobs } from '@alshafra/social';
import { requirePermission, type Actor } from './permissions';
import { writeAudit } from './audit';

export async function runWorkers(db: SqlClient, actor: Actor | null, limit = 10) {
  if (actor) requirePermission(actor, 'automation.edit');
  const social = await processSocialJobs(db, limit);
  if (actor) {
    await writeAudit(db, actor, 'jobs.run', 'worker', null, null, { social: social.length });
  }
  return { social };
}
