export interface TurnstileResult {
  ok: boolean;
  reason?: string;
}

export function turnstileConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean((env.TURNSTILE_SECRET_KEY || '').trim());
}

export async function verifyTurnstile(
  token: string | undefined,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<TurnstileResult> {
  const secret = (env.TURNSTILE_SECRET_KEY || '').trim();
  const mode = env.ALSHAFRA_ENV || 'development';
  if (!secret) {
    if (mode === 'production') return { ok: false, reason: 'turnstile_not_configured' };
    if (token === 'dev-ok') return { ok: true };
    return { ok: false, reason: 'turnstile_required' };
  }
  if (!token) return { ok: false, reason: 'turnstile_required' };
  const body = new URLSearchParams({ secret, response: token });
  const res = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) return { ok: false, reason: 'turnstile_http' };
  const data = (await res.json()) as { success?: boolean };
  return data.success ? { ok: true } : { ok: false, reason: 'turnstile_failed' };
}
