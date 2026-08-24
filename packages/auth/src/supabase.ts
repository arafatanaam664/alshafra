/**
 * Server-only Supabase Auth verification.
 * Never import this module from apps/web or apps/admin client bundles.
 */

export interface VerifiedStaffIdentity {
  authUserId: string;
  email: string;
}

export function supabaseAuthReady(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.SUPABASE_URL && (env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY));
}

/**
 * Verify a user access token against Supabase Auth.
 * Uses the anon key when present. Service role is a server fallback only.
 */
export async function verifySupabaseAccessToken(
  accessToken: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<VerifiedStaffIdentity | null> {
  const token = accessToken.trim();
  const base = (env.SUPABASE_URL || '').replace(/\/$/, '');
  const apikey = env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!token || !base || !apikey) return null;
  try {
    const response = await fetch(`${base}/auth/v1/user`, {
      headers: {
        authorization: `Bearer ${token}`,
        apikey,
      },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { id?: string; email?: string };
    if (!data.email || !data.id) return null;
    return { authUserId: data.id, email: String(data.email).trim().toLowerCase() };
  } catch {
    return null;
  }
}
