import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { applyMigrations, fromPglite, seedDatabase } from '@alshafra/database';
import {
  cookieSecurityFlags,
  encodeCookie,
  handleAdminApi,
  handlePublicApi,
  hasPermission,
  isDevLoginAllowed,
  isProductionEnv,
  provisionStaff,
  publishSite,
} from '@alshafra/cms';
import {
  applyFeatureFlags,
  applySectionOverrides,
  flagAllowsSection,
  navSections,
  PLATFORM_SECTIONS,
} from '@alshafra/content';
import { recordAnalyticsEvent } from '@alshafra/analytics';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

async function main() {
  if (isProductionEnv({ ALSHAFRA_ENV: 'development', NODE_ENV: 'production' } as NodeJS.ProcessEnv)) {
    fail('explicit development must not be treated as production');
  }
  if (!isProductionEnv({ ALSHAFRA_ENV: 'production', ADMIN_DEV_LOGIN: 'true' } as NodeJS.ProcessEnv)) {
    fail('ALSHAFRA_ENV=production must be production');
  }
  if (!isProductionEnv({ VERCEL_ENV: 'production' } as NodeJS.ProcessEnv)) {
    fail('VERCEL_ENV=production must be production');
  }
  if (isDevLoginAllowed({ ALSHAFRA_ENV: 'production', ADMIN_DEV_LOGIN: 'true' } as NodeJS.ProcessEnv)) {
    fail('dev login must be impossible in production');
  }

  const prodCookie = cookieSecurityFlags({ ALSHAFRA_ENV: 'production' } as NodeJS.ProcessEnv);
  if (!prodCookie.includes('HttpOnly') || !prodCookie.includes('Secure') || !prodCookie.includes('SameSite=Lax')) {
    fail(`production cookie flags ${prodCookie}`);
  }
  const devCookie = cookieSecurityFlags({ ALSHAFRA_ENV: 'development' } as NodeJS.ProcessEnv);
  if (devCookie.includes('Secure')) fail('development cookie should not force Secure');
  const signed = encodeCookie('00000000-0000-0000-0000-000000000001', 'secret', {
    ALSHAFRA_ENV: 'production',
  } as NodeJS.ProcessEnv);
  if (!signed.includes('Secure')) fail('production Set-Cookie missing Secure');

  const hidden = applyFeatureFlags(PLATFORM_SECTIONS, { calendar_enabled: false, tools_enabled: true, trends_enabled: true });
  if (navSections(hidden).some((section) => section.key === 'calendar')) fail('calendar flag off still in nav');
  if (!navSections(hidden).some((section) => section.key === 'tools')) fail('tools vanished when calendar flag flipped');
  if (!flagAllowsSection({ featureFlag: 'calendar_enabled' }, { calendar_enabled: true })) fail('flag true should allow');
  const missingFlag = applyFeatureFlags(PLATFORM_SECTIONS, {});
  if (!navSections(missingFlag).some((section) => section.key === 'calendar')) {
    fail('missing flag key must not hide beachhead calendar');
  }
  const futureOn = applySectionOverrides(PLATFORM_SECTIONS, {
    version: 1,
    sections: [{ key: 'opportunities', enabled: true, showInNav: true }],
  });
  if (navSections(applyFeatureFlags(futureOn, { opportunities_enabled: true })).some((s) => s.key === 'opportunities')) {
    fail('section without public page must stay out of nav even if flag on');
  }

  const published = JSON.parse(readFileSync(join(process.cwd(), 'apps/web/public/published.json'), 'utf8')) as {
    published: { path: string }[];
  };
  const inventory = new Set(published.published.map((row) => row.path));
  if (inventory.size !== 127) fail(`inventory ${inventory.size}`);
  for (const path of ['/', '/today', '/salaries', '/date-converter', '/hijri-calendar']) {
    if (!inventory.has(path)) fail(`legacy path missing from inventory ${path}`);
  }

  process.env.ALSHAFRA_ENV = 'development';
  process.env.ADMIN_DEV_LOGIN = 'true';
  process.env.ADMIN_SESSION_SECRET = 'test-secret-phase15';
  process.env.ALSHAFRA_SNAPSHOT_PATH = join(process.cwd(), 'packages/database/data/phase15-snapshot.json');
  delete process.env.ALSHAFRA_DEPLOY_HOOK_URL;
  delete process.env.VERCEL_DEPLOY_HOOK_URL;
  delete process.env.ALSHAFRA_SNAPSHOT_PUT_URL;

  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  const client = fromPglite(db);
  await applyMigrations(client);
  await seedDatabase(client);

  const admin = await provisionStaff(client, 'admin@local.test', 'admin');
  const editor = await provisionStaff(client, 'editor@local.test', 'editor');
  const moderator = await provisionStaff(client, 'moderator@local.test', 'moderator');

  for (const key of ['documents.read', 'flags.read', 'settings.read', 'health.read', 'users.read', 'documents.update']) {
    if (!hasPermission(admin, key)) fail(`admin missing ${key}`);
  }
  if (hasPermission(admin, 'users.roles_grant')) fail('admin must not grant roles');
  if (hasPermission(admin, 'seo.force_index_ugc')) fail('admin must not force-index UGC');
  if (hasPermission(editor, 'flags.read')) fail('editor must not read flags');
  if (hasPermission(editor, 'settings.write')) fail('editor must not write settings');
  if (hasPermission(moderator, 'documents.publish')) fail('moderator must not publish');
  if (hasPermission(moderator, 'flags.toggle')) fail('moderator must not toggle flags');

  const visitor = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/dashboard', search: '', headers: {} },
    client,
  );
  if (visitor.status !== 401) fail(`visitor dashboard ${visitor.status}`);

  const prevEnv = process.env.ALSHAFRA_ENV;
  process.env.ALSHAFRA_ENV = 'production';
  process.env.ADMIN_DEV_LOGIN = 'true';
  const prodLogin = await handleAdminApi(
    {
      method: 'POST',
      pathname: '/api/v1/admin/auth/login',
      search: '',
      headers: {},
      body: { email: 'admin@local.test' },
    },
    client,
  );
  if (prodLogin.status !== 501) fail(`production dev login ${prodLogin.status}`);
  if (prodLogin.headers?.['Set-Cookie']) fail('production dev login must not set a cookie');
  const prodBody = prodLogin.body as { error?: string };
  if (prodBody.error !== 'production_auth_not_configured') fail(`production error ${prodBody.error}`);
  process.env.ALSHAFRA_ENV = prevEnv;
  process.env.ADMIN_DEV_LOGIN = 'true';

  const login = await handleAdminApi(
    {
      method: 'POST',
      pathname: '/api/v1/admin/auth/login',
      search: '',
      headers: {},
      body: { email: 'admin@local.test' },
    },
    client,
  );
  if (login.status !== 200) fail(`admin login ${login.status} ${JSON.stringify(login.body)}`);
  const cookie = login.headers?.['Set-Cookie'] || '';
  if (!cookie.includes('HttpOnly') || !cookie.includes('SameSite=Lax')) fail(`dev cookie ${cookie}`);
  if (cookie.includes('Secure')) fail('dev cookie unexpectedly Secure');

  for (const path of [
    '/api/v1/admin/dashboard',
    '/api/v1/admin/flags',
    '/api/v1/admin/settings',
    '/api/v1/admin/health',
    '/api/v1/admin/users',
    '/api/v1/admin/documents',
  ]) {
    const res = await handleAdminApi({ method: 'GET', pathname: path, search: '', headers: { cookie } }, client);
    if (res.status !== 200) fail(`admin GET ${path} → ${res.status} ${JSON.stringify(res.body)}`);
  }

  const editorLogin = await handleAdminApi(
    {
      method: 'POST',
      pathname: '/api/v1/admin/auth/login',
      search: '',
      headers: {},
      body: { email: 'editor@local.test' },
    },
    client,
  );
  const editorCookie = editorLogin.headers?.['Set-Cookie'] || '';
  const editorFlags = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/flags', search: '', headers: { cookie: editorCookie } },
    client,
  );
  if (editorFlags.status !== 403) fail(`editor flags ${editorFlags.status}`);

  const modLogin = await handleAdminApi(
    {
      method: 'POST',
      pathname: '/api/v1/admin/auth/login',
      search: '',
      headers: {},
      body: { email: 'moderator@local.test' },
    },
    client,
  );
  const modCookie = modLogin.headers?.['Set-Cookie'] || '';
  const modSettings = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/settings', search: '', headers: { cookie: modCookie } },
    client,
  );
  if (modSettings.status === 200) fail('moderator must not read settings');

  try {
    await recordAnalyticsEvent(client, {
      name: 'page_view',
      path: '/today',
      props: { email: 'leak@example.com' },
      sessionHash: 'session-phase15',
    });
    fail('PII accepted');
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('email')) fail(`pii ${error}`);
  }

  const first = await recordAnalyticsEvent(client, {
    name: 'page_view',
    path: '/today',
    sessionHash: 'session-phase15',
  });
  const second = await recordAnalyticsEvent(client, {
    name: 'page_view',
    path: '/today',
    sessionHash: 'session-phase15',
  });
  if (!first.accepted || !second.accepted) fail('page_view rejected');
  const daily = await client.query<{ views: number; unique_sessions: number }>(
    `SELECT views, unique_sessions FROM page_view_daily WHERE path = '/today'`,
  );
  if ((daily.rows[0]?.views ?? 0) !== 2) fail(`views ${daily.rows[0]?.views}`);
  if ((daily.rows[0]?.unique_sessions ?? -1) !== 1) fail(`unique_sessions should be 1, got ${daily.rows[0]?.unique_sessions}`);

  const analytics = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/analytics', search: '', headers: { cookie } },
    client,
  );
  const analyticsBody = analytics.body as { uniqueSessions: null; uniqueSessionsAvailable: boolean };
  if (analyticsBody.uniqueSessions !== null || analyticsBody.uniqueSessionsAvailable !== false) {
    fail('analytics must not claim unique sessions');
  }

  const publicEvent = await handlePublicApi(
    { method: 'POST', pathname: '/api/v1/public/events', search: '', body: { name: 'share', path: '/today', sessionHash: 'session-phase15' } },
    client,
  );
  if (publicEvent.status !== 202) fail(`public events ${publicEvent.status}`);

  const publishedSnap = await publishSite(client, admin, { triggerDeploy: true });
  if (publishedSnap.live) fail('publish must not claim live without upload+deploy config');
  if (publishedSnap.stages.snapshot !== 'written') fail('snapshot stage');
  if (publishedSnap.stages.deploy !== 'not_configured') fail(`deploy stage ${publishedSnap.stages.deploy}`);
  if (!String(publishedSnap.note || '').includes('الحي')) fail('note should say the live site was not updated');

  const status = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/site-publish', search: '', headers: { cookie } },
    client,
  );
  if (status.status !== 200) fail(`publish status ${status.status}`);

  console.log(
    JSON.stringify(
      {
        ok: true,
        adminReads: true,
        productionDevLoginBlocked: true,
        cookieSecureInProduction: true,
        flagsHideNavOnly: true,
        uniqueSessionsHonest: true,
        publishNotLive: true,
        inventory: inventory.size,
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
