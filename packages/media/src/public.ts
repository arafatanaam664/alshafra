/** Browser-safe helpers. Never read R2 secrets here. */

export function normalizePublicBase(url: string | undefined | null): string | null {
  const raw = (url || '').trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, '');
}

export function publicObjectUrl(key: string, publicBase = process.env.PUBLIC_R2_PUBLIC_BASE_URL): string | null {
  const base = normalizePublicBase(publicBase) || normalizePublicBase(process.env.R2_PUBLIC_BASE_URL);
  if (!base || !key) return null;
  if (key.startsWith('private/')) return null;
  return `${base}/${key.replace(/^\/+/, '')}`;
}

export function readPublicMediaBase(
  env: { PUBLIC_R2_PUBLIC_BASE_URL?: string; R2_PUBLIC_BASE_URL?: string } = process.env,
): string | null {
  return normalizePublicBase(env.PUBLIC_R2_PUBLIC_BASE_URL) || normalizePublicBase(env.R2_PUBLIC_BASE_URL);
}
