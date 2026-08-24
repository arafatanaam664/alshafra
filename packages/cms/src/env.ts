/** Runtime environment helpers. Never treat unset ALSHAFRA_ENV as production. */

export function namedRuntimeEnv(env: NodeJS.ProcessEnv = process.env): string {
  return (env.ALSHAFRA_ENV || '').trim().toLowerCase();
}

/**
 * Production is an explicit signal.
 * - ALSHAFRA_ENV=production
 * - VERCEL_ENV=production
 * ALSHAFRA_ENV=development|test always wins (local tests, preview).
 */
export function isProductionEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  const named = namedRuntimeEnv(env);
  if (named === 'development' || named === 'test') return false;
  if (named === 'production') return true;
  return (env.VERCEL_ENV || '').trim().toLowerCase() === 'production';
}

export function isDevLoginAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  if (isProductionEnv(env)) return false;
  return env.ADMIN_DEV_LOGIN === 'true';
}

export function isSupabaseAuthConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.SUPABASE_URL && (env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY));
}

export type AuthMode = 'dev' | 'supabase' | 'unavailable';

export function authMode(env: NodeJS.ProcessEnv = process.env): AuthMode {
  if (isProductionEnv(env)) return isSupabaseAuthConfigured(env) ? 'supabase' : 'unavailable';
  return isDevLoginAllowed(env) ? 'dev' : 'unavailable';
}

export function authStatus(env: NodeJS.ProcessEnv = process.env) {
  return {
    production: isProductionEnv(env),
    devLogin: isDevLoginAllowed(env),
    supabaseConfigured: isSupabaseAuthConfigured(env),
    mode: authMode(env),
  };
}
