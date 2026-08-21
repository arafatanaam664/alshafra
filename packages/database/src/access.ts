export type DatabaseClientKind = 'browser' | 'server' | 'service';

export interface DatabaseAccess {
  kind: DatabaseClientKind;
}

/**
 * UI / islands must never construct a service-role client.
 * Enforced here and by tools/check-boundaries.mjs.
 */
export function assertNotBrowserService(kind: DatabaseClientKind, isBrowser: boolean): void {
  if (kind === 'service' && isBrowser) {
    throw new Error('SUPABASE_SERVICE_ROLE must not run in the browser');
  }
}

export function assertNoServiceKeyInPublicEnv(env: Record<string, string | undefined>): void {
  const leaked = env.SUPABASE_SERVICE_ROLE_KEY;
  if (typeof globalThis !== 'undefined' && 'window' in globalThis && leaked) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must not be present in a browser bundle');
  }
}

export const SERVER_ONLY_DB_ENV = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
] as const;
