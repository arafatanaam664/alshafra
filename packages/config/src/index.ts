export const ENV_NAMES = [
  'PUBLIC_SITE_URL',
  'PUBLIC_ADSENSE_CLIENT',
  'PUBLIC_GA_ID',
  'PUBLIC_TURNSTILE_SITE_KEY',
  'PUBLIC_R2_PUBLIC_BASE_URL',
  'DATABASE_URL',
  'ALSHAFRA_ENV',
  'ALSHAFRA_CONTENT_SOURCE',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'INDEXNOW_KEY',
  'SOCIAL_TOKEN_KEY',
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'ADSENSE_SLOTS',
  'CRON_SECRET',
] as const;

export type EnvName = (typeof ENV_NAMES)[number];

export interface PublicEnv {
  siteUrl: string;
}

export function readPublicSiteUrl(env: Record<string, string | undefined> = {}): string {
  return env.PUBLIC_SITE_URL ?? env.VITE_SITE_URL ?? 'https://alshafra.com';
}

/** Browser bundles must never read these keys. */
export const SERVER_ONLY_ENV: readonly string[] = [
  'DATABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'R2_SECRET_ACCESS_KEY',
  'R2_ACCESS_KEY_ID',
  'SOCIAL_TOKEN_KEY',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'CRON_SECRET',
];
