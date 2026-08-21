import { assertNotBrowserService, type DatabaseClientKind } from './access';

export interface DatabaseEnv {
  DATABASE_URL?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export function readDatabaseEnv(env: Record<string, string | undefined> = process.env): DatabaseEnv {
  return {
    DATABASE_URL: env.DATABASE_URL,
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function hasRemoteDatabase(env: DatabaseEnv = readDatabaseEnv()): boolean {
  return Boolean(env.DATABASE_URL || (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY));
}

/**
 * Factory for a future @supabase/supabase-js client.
 * Phase 4 does not require a live Supabase project; local tests use PGlite.
 */
export function createSupabaseConfig(kind: DatabaseClientKind, env: DatabaseEnv, isBrowser = false) {
  assertNotBrowserService(kind, isBrowser);
  if (!env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL is not set');
  }
  if (kind === 'service') {
    if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    return { url: env.SUPABASE_URL, key: env.SUPABASE_SERVICE_ROLE_KEY, kind };
  }
  if (!env.SUPABASE_ANON_KEY) throw new Error('SUPABASE_ANON_KEY is not set');
  return { url: env.SUPABASE_URL, key: env.SUPABASE_ANON_KEY, kind };
}
