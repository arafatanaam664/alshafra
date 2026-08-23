import { applyMigrations, fromPglite, seedDatabase } from '@alshafra/database';
import { handleAdminApi, provisionStaff } from '@alshafra/cms';
import { PLATFORM_SECTIONS } from '@alshafra/content';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

async function main() {
  process.env.ALSHAFRA_ENV = 'development';
  process.env.ADMIN_DEV_LOGIN = 'true';
  process.env.ADMIN_SESSION_SECRET = 'test-secret-phase45-sections';

  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  const client = fromPglite(db);
  await applyMigrations(client);
  await seedDatabase(client);
  await provisionStaff(client, 'admin@local.test', 'admin');
  await provisionStaff(client, 'editor@local.test', 'editor');

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
  if (login.status !== 200) fail(`admin login ${login.status}`);
  const cookie = login.headers?.['Set-Cookie'] || '';

  const catalog = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/sections', search: '', headers: { cookie } },
    client,
  );
  if (catalog.status !== 200) fail(`sections GET ${catalog.status} ${JSON.stringify(catalog.body)}`);
  const body = catalog.body as { sections: { key: string; enabled: boolean }[]; contract: { nameOpensHub: boolean } };
  if (!Array.isArray(body.sections) || body.sections.length < PLATFORM_SECTIONS.length) fail('catalog too small');
  if (!body.contract?.nameOpensHub) fail('contract missing');

  const hide = await handleAdminApi(
    {
      method: 'PATCH',
      pathname: '/api/v1/admin/sections/articles',
      search: '',
      headers: { cookie },
      body: { showInNav: false, name: 'المقالات' },
    },
    client,
  );
  if (hide.status !== 200) fail(`patch articles ${hide.status} ${JSON.stringify(hide.body)}`);

  const locked = await handleAdminApi(
    {
      method: 'PATCH',
      pathname: '/api/v1/admin/sections/calendar',
      search: '',
      headers: { cookie },
      body: { path: '/saudi-calendar' },
    },
    client,
  );
  if (locked.status === 200) fail('locked path must be rejected');

  const empty = await handleAdminApi(
    {
      method: 'PATCH',
      pathname: '/api/v1/admin/sections/news',
      search: '',
      headers: { cookie },
      body: { enabled: true },
    },
    client,
  );
  if (empty.status === 200) fail('news must not enable without a public page');

  const leak = await handleAdminApi(
    {
      method: 'PATCH',
      pathname: '/api/v1/admin/sections/tools',
      search: '',
      headers: { cookie },
      body: { name: 'الأدوات شركة عالمية' },
    },
    client,
  );
  if (leak.status === 200) fail('leaky public name must be rejected');

  const nav = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/navigation', search: '', headers: { cookie } },
    client,
  );
  if (nav.status !== 200) fail(`navigation GET ${nav.status}`);
  const navBody = nav.body as { items: { key: string; showInNav: boolean }[] };
  if (navBody.items.find((item) => item.key === 'articles')?.showInNav !== false) {
    fail('articles should be hidden from nav after patch');
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
  const editorRead = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/sections', search: '', headers: { cookie: editorCookie } },
    client,
  );
  if (editorRead.status !== 200) fail('editor should read sections');
  const editorWrite = await handleAdminApi(
    {
      method: 'PATCH',
      pathname: '/api/v1/admin/sections/tools',
      search: '',
      headers: { cookie: editorCookie },
      body: { showInHome: false },
    },
    client,
  );
  if (editorWrite.status === 200) fail('editor must not write sections');

  console.log(
    JSON.stringify(
      {
        ok: true,
        sections: body.sections.length,
        locked: locked.status,
        empty: empty.status,
        leak: leak.status,
        editorWrite: editorWrite.status,
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
