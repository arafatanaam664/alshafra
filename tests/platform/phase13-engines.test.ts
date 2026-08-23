import { applyMigrations, fromPglite, seedDatabase } from '@alshafra/database';
import {
  createOpportunity,
  handleAdminApi,
  handlePublicApi,
  listPublicOpportunities,
  provisionStaff,
  publishSite,
} from '@alshafra/cms';
import { listingCanAppearPublic, parseListingData } from '@alshafra/content';
import { enqueueSocialPublish, processSocialJobs } from '@alshafra/social';
import { recordAnalyticsEvent } from '@alshafra/analytics';
import { dispatchAutomation } from '@alshafra/cms';
import { join } from 'node:path';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

async function main() {
  process.env.ALSHAFRA_ENV = 'development';
  process.env.ADMIN_DEV_LOGIN = 'true';
  process.env.ADMIN_SESSION_SECRET = 'test-secret-phase13';
  process.env.ALSHAFRA_SNAPSHOT_PATH = join(process.cwd(), 'packages/database/data/phase13-snapshot.json');

  if (listingCanAppearPublic({ published: true, data: parseListingData({ kind: 'job', sourceName: 'جهة' }), flags: {} })) {
    fail('jobs must stay off without flags');
  }

  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  const client = fromPglite(db);
  await applyMigrations(client);
  await seedDatabase(client);
  const actor = await provisionStaff(client, 'admin@local.test', 'admin');

  const created = await createOpportunity(client, actor, {
    title: 'وظيفة تجريبية في التطوير',
    excerpt: 'وصف قصير',
    kind: 'job',
    listing: { kind: 'job', sourceName: 'مصدر موثوق', deadline: '2099-01-01' },
  });
  if (!created.path.startsWith('/opportunity/')) fail(`path ${created.path}`);

  const hidden = await listPublicOpportunities(client, { jobs_enabled: false, opportunities_enabled: false });
  if (hidden.length) fail('unpublished/flag-off listing leaked');

  const expired = listingCanAppearPublic({
    published: true,
    data: parseListingData({ kind: 'job', sourceName: 'مصدر', deadline: '2020-01-01' }),
    flags: { jobs_enabled: true },
  });
  if (expired) fail('expired listing must stay private');

  const login = await handleAdminApi(
    { method: 'POST', pathname: '/api/v1/admin/auth/login', search: '', headers: {}, body: { email: 'admin@local.test' } },
    client,
  );
  if (login.status !== 200) fail(`login ${login.status}`);
  const cookie = login.headers?.['Set-Cookie'] || '';

  const pubTry = await handleAdminApi(
    {
      method: 'POST',
      pathname: `/api/v1/admin/documents/${created.id}/transition`,
      search: '',
      headers: { cookie },
      body: { to: 'review' },
    },
    client,
  );
  if (pubTry.status !== 200) fail(`to review ${pubTry.status} ${JSON.stringify(pubTry.body)}`);
  const published = await handleAdminApi(
    {
      method: 'POST',
      pathname: `/api/v1/admin/documents/${created.id}/transition`,
      search: '',
      headers: { cookie },
      body: { to: 'published' },
    },
    client,
  );
  if (published.status !== 200) fail(`publish ${published.status} ${JSON.stringify(published.body)}`);

  await client.query(`UPDATE feature_flags SET is_enabled = true WHERE key = 'jobs_enabled'`);
  const live = await listPublicOpportunities(client, { jobs_enabled: true });
  if (live.length !== 1) fail(`expected 1 public listing, got ${live.length}`);

  const offHub = await handlePublicApi({ method: 'GET', pathname: '/api/v1/public/questions', search: '' }, client);
  if (offHub.status !== 404) fail(`community hub while off ${offHub.status}`);

  const ads = await handlePublicApi({ method: 'GET', pathname: '/api/v1/public/ads', search: '' }, client);
  const adsBody = ads.body as { enabled: boolean };
  if (adsBody.enabled) fail('ads must stay off');

  try {
    await recordAnalyticsEvent(client, { name: 'page_view', path: '/', props: { email: 'a@b.c' }, sessionHash: 'sessionxx' });
    fail('pii accepted');
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('email')) fail(`pii ${error}`);
  }
  const tracked = await recordAnalyticsEvent(client, { name: 'page_view', path: '/today', sessionHash: 'sessionxx' });
  if (!tracked.accepted) fail('event rejected');

  const queued = await enqueueSocialPublish(client, {
    documentId: created.id,
    provider: 'telegram',
    rendered: { title: 'تجربة', url: 'https://alshafra.com/today' },
  });
  const queued2 = await enqueueSocialPublish(client, {
    documentId: created.id,
    provider: 'telegram',
    rendered: { title: 'تجربة', url: 'https://alshafra.com/today' },
  });
  if (!queued2.reused || queued.id !== queued2.id) fail('social idempotency');
  const processed = await processSocialJobs(client, 5);
  if (!processed.some((item) => item.status === 'succeeded')) fail(`social worker ${JSON.stringify(processed)}`);

  await dispatchAutomation(client, {
    name: 'document.published',
    documentId: created.id,
    title: 'تجربة',
    path: created.path,
    url: `https://alshafra.com${created.path}`,
  });

  const snap = await publishSite(client, actor);
  if (snap.routes < 1) fail('snapshot empty');

  const status = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/site-publish', search: '', headers: { cookie } },
    client,
  );
  if (status.status !== 200) fail(`publish status ${status.status}`);

  console.log(
    JSON.stringify(
      {
        ok: true,
        opportunity: created.path,
        publicListings: live.length,
        communityOff: offHub.status,
        ads: adsBody.enabled,
        social: processed[0]?.status,
        snapshotRoutes: snap.routes,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
