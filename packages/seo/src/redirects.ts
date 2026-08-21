export const GONE_PREFIXES = ['/category', '/languages', '/news'] as const;

export const PERMANENT_REDIRECTS = [{ source: '/index.html', destination: '/' }] as const;

export function isGonePath(path: string): boolean {
  return GONE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
