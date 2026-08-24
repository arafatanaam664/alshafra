import { FEATURE_FLAG_SEEDS } from '@alshafra/database';
import { authStatus, isDevLoginAllowed, isProductionEnv } from '@alshafra/cms';
import { applyFeatureFlags, navSections, PLATFORM_SECTIONS } from '@alshafra/content';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

if (isProductionEnv({ VERCEL_ENV: 'preview' } as NodeJS.ProcessEnv)) {
  fail('Vercel preview must not be treated as production');
}
if (!isDevLoginAllowed({ VERCEL_ENV: 'preview', ADMIN_DEV_LOGIN: 'true' } as NodeJS.ProcessEnv)) {
  fail('preview may use local staff login only when ADMIN_DEV_LOGIN=true');
}
if (isDevLoginAllowed({ VERCEL_ENV: 'preview' } as NodeJS.ProcessEnv)) {
  fail('preview without ADMIN_DEV_LOGIN must not allow email login');
}
if (isDevLoginAllowed({ ALSHAFRA_ENV: 'production', VERCEL_ENV: 'preview', ADMIN_DEV_LOGIN: 'true' } as NodeJS.ProcessEnv)) {
  fail('ALSHAFRA_ENV=production wins over preview');
}

const previewStatus = authStatus({ VERCEL_ENV: 'preview', ADMIN_DEV_LOGIN: 'true' } as NodeJS.ProcessEnv);
if (previewStatus.production) fail('preview status marked production');
if (JSON.stringify(previewStatus).match(/secret|service_role|token/i)) fail('auth status leaked a secret key name');

const off = [
  'community_enabled',
  'jobs_enabled',
  'scholarships_enabled',
  'opportunities_enabled',
  'travel_enabled',
  'comparisons_enabled',
  'ai_enabled',
  'ads_enabled',
  'news_enabled',
  'apps_enabled',
  'social_auto_publish_enabled',
];
for (const key of off) {
  if (FEATURE_FLAG_SEEDS.find((flag) => flag.key === key)?.isEnabled) fail(`${key} must stay off for launch`);
}
for (const key of ['calendar_enabled', 'tools_enabled', 'trends_enabled']) {
  if (!FEATURE_FLAG_SEEDS.find((flag) => flag.key === key)?.isEnabled) fail(`${key} must stay on for the beachhead`);
}

const flags = Object.fromEntries(FEATURE_FLAG_SEEDS.map((flag) => [flag.key, flag.isEnabled]));
const nav = navSections(applyFeatureFlags(PLATFORM_SECTIONS, flags));
if (!nav.some((section) => section.key === 'calendar')) fail('calendar missing from launch nav');
if (!nav.some((section) => section.key === 'tools')) fail('tools missing from launch nav');
if (nav.some((section) => ['community', 'opportunities', 'travel', 'comparisons', 'ai', 'news', 'apps'].includes(section.key))) {
  fail('future section leaked into launch nav');
}

console.log(JSON.stringify({ ok: true, preview: previewStatus.mode, nav: nav.map((section) => section.key) }, null, 2));
