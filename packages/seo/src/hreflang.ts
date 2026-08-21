import { selfCanonical } from './canonical';

/** Only emit when at least two real locales exist. Do not invent 16 languages. */
export function hreflangAlternates(
  path: string,
  locales: string[] = ['ar'],
): { hreflang: string; href: string }[] {
  const real = locales.filter(Boolean);
  if (real.length < 2) return [];
  return real.map((locale) => ({
    hreflang: locale,
    href: locale === 'ar' ? selfCanonical(path) : selfCanonical(`/${locale}${path === '/' ? '' : path}`),
  }));
}
