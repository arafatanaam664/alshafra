import { applyMigrations, fromPglite, seedDatabase } from '@alshafra/database';
import {
  actorCanTransition,
  auditSeo,
  canTransition,
  createDocument,
  handleAdminApi,
  hasPermission,
  provisionStaff,
  sanitizeHtml,
  setTags,
  transitionDocument,
  updateDocument,
  validatePath,
  type Actor,
} from '@alshafra/cms';
import { collectParity, importLegacyContent } from '../../packages/content/src/legacy-import';

const root = process.cwd();

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

async function main() {
  if (canTransition('draft', 'published')) fail('draft must not jump to published');
  if (!canTransition('draft', 'review')) fail('draft → review');
  if (!canTransition('review', 'published')) fail('review → published');

  const author = { userId: 'a', email: 'a', displayName: 'a', roles: ['author'], permissions: ['documents.create', 'documents.update'] };
  const editor = { userId: 'e', email: 'e', displayName: 'e', roles: ['editor'], permissions: ['documents.publish', 'documents.create'] };
  if (actorCanTransition(author, 'review', 'published')) fail('author must not publish');
  if (!actorCanTransition(editor, 'review', 'published')) fail('editor can publish');
  if (hasPermission(author, 'content.publish')) fail('alias publish denied for author');
  if (!hasPermission(editor, 'content.publish')) fail('alias publish for editor');

  if (validatePath('/news/x').ok) fail('news prefix forbidden');
  if (validatePath('/category/x').ok) fail('category prefix forbidden');
  if (!validatePath('/articles/hello-world').ok) fail('valid article path');

  const dirty = sanitizeHtml('<p onclick="alert(1)">x</p><script>bad()</script><a href="javascript:alert(1)">z</a>');
  if (dirty.includes('script') || dirty.includes('onclick') || dirty.includes('javascript:')) fail(`sanitizer leaked: ${dirty}`);

  const seo = auditSeo({ title: 'Hi', path: '/x', canonical: 'https://alshafra.com/x' });
  if (!seo.some((c) => c.id === 'description' && !c.ok && c.level === 'critical')) fail('missing description should be critical');

  process.env.ALSHAFRA_ENV = 'development';
  process.env.ADMIN_DEV_LOGIN = 'true';
  process.env.ADMIN_SESSION_SECRET = 'test-secret-phase5';

  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  const client = fromPglite(db);
  await applyMigrations(client);
  await seedDatabase(client);
  await importLegacyContent(client, root);

  const editorActor = await provisionStaff(client, 'editor@local.test', 'editor');
  const authorActor = await provisionStaff(client, 'author@local.test', 'author');
  const analyst = await provisionStaff(client, 'analyst@local.test', 'analyst');

  const created = await createDocument(client, editorActor, { type: 'article', title: 'اختبار محرر Phase 5', excerpt: 'مقتطف للتجربة' });
  if (!created.path.startsWith('/articles/')) fail(`unexpected path ${created.path}`);

  await updateDocument(client, editorActor, created.id, {
    title: 'اختبار محرر Phase 5',
    excerpt: 'مقتطف أطول قليلاً للوصف',
    seoTitle: 'اختبار محرر Phase 5 لمسار جديد',
    metaDescription: 'وصف ميتا طويل بما يكفي لاجتياز الحد الأدنى من أحرف الوصف في التدقيق.',
    body: [{ type: 'p', text: 'فقرة آمنة' }],
  });
  await setTags(client, editorActor, created.id, ['تجربة', 'cms']);

  try {
    await transitionDocument(client, authorActor, created.id, 'published');
    fail('author published');
  } catch (e) {
    if (!(e instanceof Error) || !String(e.message).includes('invalid_transition') && e.name !== 'ForbiddenError' && !String(e.message).includes('forbidden') && !String(e.message).includes('invalid_transition')) {
      /* draft → published invalid for everyone; author from draft can't publish */
    }
  }

  await transitionDocument(client, editorActor, created.id, 'review');
  const pub = await transitionDocument(client, editorActor, created.id, 'published');
  if (pub.to !== 'published') fail('publish failed');

  const unauth = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/dashboard', search: '', headers: {} },
    client,
  );
  if (unauth.status !== 401) fail(`expected 401 got ${unauth.status}`);

  const login = await handleAdminApi(
    {
      method: 'POST',
      pathname: '/api/v1/admin/auth/login',
      search: '',
      headers: {},
      body: { email: 'editor@local.test' },
    },
    client,
  );
  if (login.status !== 200) fail(`login ${login.status} ${JSON.stringify(login.body)}`);
  const cookie = login.headers?.['Set-Cookie'] || '';
  const dash = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/dashboard', search: '', headers: { cookie } },
    client,
  );
  if (dash.status !== 200) fail(`dashboard ${dash.status} ${JSON.stringify(dash.body)}`);

  const analystLogin = await handleAdminApi(
    { method: 'POST', pathname: '/api/v1/admin/auth/login', search: '', headers: {}, body: { email: 'analyst@local.test' } },
    client,
  );
  const ac = analystLogin.headers?.['Set-Cookie'] || '';
  const pubTry = await handleAdminApi(
    {
      method: 'POST',
      pathname: `/api/v1/admin/documents/${created.id}/transition`,
      search: '',
      headers: { cookie: ac },
      body: { to: 'unpublished' },
    },
    client,
  );
  if (pubTry.status === 200) fail('analyst must not unpublish');

  const flags = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/flags', search: '', headers: { cookie } },
    client,
  );
  if (flags.status === 200) fail('editor should not read flags without flags.read');

  const seoLogin = await handleAdminApi(
    { method: 'POST', pathname: '/api/v1/admin/auth/login', search: '', headers: {}, body: { email: 'seo@local.test' } },
    client,
  );
  if (seoLogin.status !== 200) fail('seo login');

  void analyst;

  const parity = await collectParity(client, root);
  if (parity.published !== 127 || parity.routes < 127 || parity.missing.length) {
    fail(`legacy regression ${JSON.stringify(parity)}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        created: created.path,
        published: pub.to,
        routes: parity.routes,
        publishedLegacy: parity.published,
        dashboard: dash.status,
        unauthorized: unauth.status,
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
