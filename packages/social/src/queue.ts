import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';
import { socialIdempotencyKey, type SocialPost, type SocialProvider, type SocialProviderName } from './index';

export class UnconfiguredSocialProvider implements SocialProvider {
  constructor(readonly name: SocialProviderName) {}
  async publish(): Promise<{ externalId: string }> {
    throw new Error('provider_not_configured');
  }
}

export class StubSocialProvider implements SocialProvider {
  constructor(readonly name: SocialProviderName) {}
  async publish(post: SocialPost, idempotencyKey: string): Promise<{ externalId: string }> {
    return { externalId: `stub:${this.name}:${idempotencyKey}:${post.url}` };
  }
}

export function providerFor(name: SocialProviderName, stub = process.env.ALSHAFRA_ENV !== 'production'): SocialProvider {
  return stub ? new StubSocialProvider(name) : new UnconfiguredSocialProvider(name);
}

export async function enqueueSocialPublish(
  db: SqlClient,
  input: {
    documentId: string;
    provider: SocialProviderName;
    accountId?: string | null;
    templateVersion?: string;
    rendered: SocialPost;
  },
) {
  const key = socialIdempotencyKey(input.provider, input.documentId, input.templateVersion || 'v1');
  const existing = await db.query<{ id: string; status: string }>(
    `SELECT id, status::text AS status FROM social_publish_jobs WHERE idempotency_key = $1`,
    [key],
  );
  if (existing.rows[0]) return { id: existing.rows[0].id, reused: true, status: existing.rows[0].status };

  const postId = newId();
  await db.query(
    `INSERT INTO social_posts (id, document_id, provider, account_id, rendered_json)
     VALUES ($1,$2,$3::social_provider,$4,$5::jsonb)`,
    [postId, input.documentId, input.provider, input.accountId ?? null, JSON.stringify(input.rendered)],
  );
  const jobId = newId();
  await db.query(
    `INSERT INTO social_publish_jobs (id, social_post_id, status, idempotency_key, run_at)
     VALUES ($1,$2,'queued',$3,now())`,
    [jobId, postId, key],
  );
  return { id: jobId, reused: false, status: 'queued' };
}

export async function listSocialJobs(db: SqlClient, limit = 50) {
  const rows = await db.query(
    `SELECT j.id, j.status::text AS status, j.attempts, j.last_error, j.idempotency_key,
            j.external_post_id, p.provider::text AS provider, p.document_id, p.rendered_json
     FROM social_publish_jobs j
     JOIN social_posts p ON p.id = j.social_post_id
     ORDER BY j.run_at DESC NULLS LAST
     LIMIT $1`,
    [Math.min(limit, 200)],
  );
  return rows.rows;
}

export async function processSocialJobs(db: SqlClient, limit = 10) {
  const rows = await db.query<{
    id: string;
    attempts: number;
    max_attempts: number;
    provider: SocialProviderName;
    rendered_json: SocialPost;
    idempotency_key: string;
  }>(
    `SELECT j.id, j.attempts, j.max_attempts, p.provider::text AS provider,
            p.rendered_json AS rendered_json, j.idempotency_key
     FROM social_publish_jobs j
     JOIN social_posts p ON p.id = j.social_post_id
     WHERE j.status IN ('queued','failed') AND j.attempts < j.max_attempts
     ORDER BY j.run_at ASC NULLS FIRST
     LIMIT $1`,
    [limit],
  );

  const results: { id: string; status: string; error?: string }[] = [];
  for (const job of rows.rows) {
    await db.query(`UPDATE social_publish_jobs SET status = 'running', attempts = attempts + 1 WHERE id = $1`, [job.id]);
    try {
      const provider = providerFor(job.provider);
      const published = await provider.publish(job.rendered_json, job.idempotency_key);
      await db.query(
        `UPDATE social_publish_jobs SET status = 'succeeded', external_post_id = $2, completed_at = now(), last_error = NULL WHERE id = $1`,
        [job.id, published.externalId],
      );
      results.push({ id: job.id, status: 'succeeded' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'publish_failed';
      const dead = job.attempts + 1 >= job.max_attempts;
      await db.query(
        `UPDATE social_publish_jobs SET status = $2, last_error = $3 WHERE id = $1`,
        [job.id, dead ? 'failed' : 'queued', message],
      );
      results.push({ id: job.id, status: dead ? 'failed' : 'queued', error: message });
    }
  }
  return results;
}
