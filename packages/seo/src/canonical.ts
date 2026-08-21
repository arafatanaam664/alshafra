import { SITE_URL } from './site';

export function normalizePublicPath(path: string): string {
  if (!path || path === '/') return '/';
  const trimmed = path.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function selfCanonical(path: string, siteUrl = SITE_URL): string {
  const p = normalizePublicPath(path);
  return `${siteUrl.replace(/\/+$/, '')}${p === '/' ? '/' : p}`;
}

export function neverAutoBrandSuffix(title: string): boolean {
  return !/\|\s*Alshafra\s*$/i.test(title.trim());
}

export function documentTitle(input: { title: string; seoTitle?: string | null }): string {
  return (input.seoTitle?.trim() || input.title).trim();
}
