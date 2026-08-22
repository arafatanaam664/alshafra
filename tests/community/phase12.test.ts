import { applyMigrations, fromPglite, seedDatabase } from '@alshafra/database';
import {
  castVote,
  createQuestion,
  evaluateUgcIndexable,
  findDuplicateQuestion,
  getQuestion,
  handleCommunityApi,
  handleModerationApi,
  hideQuestion,
  isCommunityPath,
  MemoryRateLimiter,
  provisionMember,
  questionPath,
  ugcRobots,
  verifyTurnstile,
} from '@alshafra/community';
import { filterIndexable, isUgcPath } from '@alshafra/seo';
import { handleAdminApi } from '@alshafra/cms';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

async function main() {
  if (!isCommunityPath('/question/x') || isUgcPath('/articles/x')) fail('path helpers');
  if (ugcRobots() !== 'noindex, follow') fail('robots');
  if (
    evaluateUgcIndexable({
      ugcAutoIndex: false,
      status: 'open',
      title: 'عنوان طويل بما يكفي للاختبار',
      body: 'جسم طويل بما يكفي لاجتياز الحد الأدنى من الجودة في البوابة.',
      answerCount: 3,
      hidden: false,
    })
  ) {
    fail('must never auto-index while seo.ugc_auto_index is false');
  }

  const captchaDev = await verifyTurnstile('dev-ok', { ALSHAFRA_ENV: 'development', TURNSTILE_SECRET_KEY: '' });
  if (!captchaDev.ok) fail('dev captcha');
  const captchaProd = await verifyTurnstile('dev-ok', { ALSHAFRA_ENV: 'production', TURNSTILE_SECRET_KEY: '' });
  if (captchaProd.ok) fail('prod must require turnstile secret');

  const limiter = new MemoryRateLimiter();
  const first = await limiter.hit('t', 2, 60);
  const second = await limiter.hit('t', 2, 60);
  const third = await limiter.hit('t', 2, 60);
  if (!first.ok || !second.ok || third.ok) fail('rate limiter');

  process.env.ALSHAFRA_ENV = 'development';
  process.env.ADMIN_DEV_LOGIN = 'true';
  process.env.ADMIN_SESSION_SECRET = 'test-secret-phase12';
  process.env.TURNSTILE_SECRET_KEY = '';

  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  const client = fromPglite(db);
  await applyMigrations(client);
  await seedDatabase(client);

  const flags = await client.query<{ is_enabled: boolean }>(
    `SELECT is_enabled FROM feature_flags WHERE key = 'community_enabled'`,
  );
  if (flags.rows[0]?.is_enabled) fail('seed must keep community off');

  const member = await provisionMember(client, { email: 'user@local.test', handle: 'tester' });
  try {
    await createQuestion(client, {
      userId: member.userId,
      title: 'كيف أحول التاريخ الهجري؟؟',
      body: 'أحتاج شرحاً واضحاً لتحويل التاريخ وفق أم القرى في السعودية.',
      turnstileToken: 'dev-ok',
      limiter,
    });
    fail('write must 404/disabled while flag off');
  } catch (error) {
    if (!(error instanceof Error) || error.message !== 'community_disabled') fail(`flag ${error}`);
  }

  const disabledHttp = await handleCommunityApi(
    {
      method: 'POST',
      pathname: '/api/v1/me/questions',
      search: '',
      memberId: member.userId,
      body: { title: 'كيف أحول التاريخ الهجري؟؟', body: 'أحتاج شرحاً واضحاً لتحويل التاريخ وفق أم القرى.', turnstileToken: 'dev-ok' },
    },
    client,
  );
  if (disabledHttp.status !== 404) fail(`public write while off ${disabledHttp.status}`);

  await client.query(`UPDATE feature_flags SET is_enabled = true WHERE key IN ('community_enabled','questions_enabled')`);

  const created = await createQuestion(client, {
    userId: member.userId,
    title: 'كيف أحول التاريخ الهجري؟؟',
    body: 'أحتاج شرحاً واضحاً لتحويل التاريخ وفق أم القرى في السعودية.',
    turnstileToken: 'dev-ok',
    limiter: new MemoryRateLimiter(),
  });
  if (!created.path.startsWith('/question/')) fail(`path ${created.path}`);
  if (created.indexable) fail('ugc indexed');
  if (created.robots !== 'noindex, follow') fail('ugc robots');
  const expected = questionPath(created.id, created.title);
  if (created.path !== expected) fail(`canonical ${created.path} ${expected}`);

  const mismatch = await getQuestion(client, created.id, 'wrong-slug');
  if (mismatch.redirect !== created.path) fail('slug mismatch should redirect');

  try {
    await createQuestion(client, {
      userId: member.userId,
      title: 'كيف أحول التاريخ الهجري؟؟',
      body: 'نص آخر طويل بما يكفي لاجتياز الحد الأدنى من الحروف في السؤال.',
      turnstileToken: 'dev-ok',
      limiter: new MemoryRateLimiter(),
    });
    fail('duplicate allowed');
  } catch (error) {
    if (!(error instanceof Error) || error.message !== 'duplicate_question') fail(`dup ${error}`);
  }
  const dup = await findDuplicateQuestion(client, 'كيف احول التاريخ الهجري؟؟');
  if (!dup) fail('normalized duplicate miss');

  try {
    await createQuestion(client, {
      userId: member.userId,
      title: 'سؤال عن رابط خارجي طويل',
      body: 'هذا النص يحتوي https://spam.example حتى يُرفض للمستخدم الجديد بعد الحد الأدنى.',
      turnstileToken: 'dev-ok',
      limiter: new MemoryRateLimiter(),
    });
    fail('new user link allowed');
  } catch (error) {
    if (!(error instanceof Error) || error.message !== 'links_forbidden_for_new_user') fail(`link ${error}`);
  }

  const vote = await castVote(client, {
    userId: member.userId,
    targetType: 'question',
    targetId: created.id,
    value: 1,
    limiter: new MemoryRateLimiter(),
  });
  const vote2 = await castVote(client, {
    userId: member.userId,
    targetType: 'question',
    targetId: created.id,
    value: 1,
    limiter: new MemoryRateLimiter(),
  });
  if (!vote2.reused || vote.value !== 1) fail('vote idempotent');

  const leaked = filterIndexable([{ path: created.path, robots: 'index, follow' }]);
  if (leaked.length) fail('ugc must stay out of sitemap');

  await hideQuestion(client, member.userId, created.id, 'test');
  const hidden = await getQuestion(client, created.id);
  if (hidden.question) fail('hidden question still public');

  const login = await handleAdminApi(
    {
      method: 'POST',
      pathname: '/api/v1/admin/auth/login',
      search: '',
      headers: {},
      body: { email: 'moderator@local.test' },
    },
    client,
  );
  if (login.status !== 200) fail(`mod login ${login.status} ${JSON.stringify(login.body)}`);
  const cookie = login.headers?.['Set-Cookie'] || '';
  const queue = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/community/questions', search: '', headers: { cookie } },
    client,
  );
  if (queue.status !== 200) fail(`moderation list ${queue.status}`);

  const status = await handleModerationApi(
    { method: 'GET', pathname: '/api/v1/admin/community/status', search: '', actorId: member.userId },
    client,
  );
  if (status.status !== 200) fail('mod status');

  console.log(
    JSON.stringify(
      {
        ok: true,
        path: created.path,
        indexable: created.indexable,
        disabled: disabledHttp.status,
        hidden: true,
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
