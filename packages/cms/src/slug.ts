import { publicPathSchema } from '@alshafra/database';

export const RESERVED_PREFIXES = ['/category/', '/languages/', '/news/', '/admin', '/api/', '/preview'];

export const HIGH_PATHS = [
  '/',
  '/date-converter',
  '/hijri-calendar',
  '/today',
  '/salaries',
  '/school-calendar',
  '/holidays',
  '/countdown',
  '/age-calculator',
  '/articles',
] as const;

export function isHighPath(path: string): boolean {
  if ((HIGH_PATHS as readonly string[]).includes(path)) return true;
  return path.startsWith('/countdown/') || path.startsWith('/articles/');
}

export function defaultPathForType(type: string, slug: string): string {
  const s = slug.replace(/^\/+|\/+$/g, '');
  switch (type) {
    case 'article':
      return `/articles/${s}`;
    case 'guide':
      return `/guide/${s}`;
    case 'solution':
      return `/solution/${s}`;
    case 'news':
      return `/update/${s}`;
    case 'trend':
      return `/trending/${s}`;
    case 'faq_page':
      return `/faq/${s}`;
    case 'comparison':
      return `/compare/${s}`;
    case 'opportunity':
    case 'job':
    case 'scholarship':
      return `/opportunity/${s}`;
    case 'legal':
      return `/${s}`;
    case 'service_info':
      return `/${s}`;
    default:
      return `/${s}`;
  }
}

export function normalizeSlug(input: string): string {
  return input
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function validatePath(path: string): { ok: true } | { ok: false; error: string } {
  const parsed = publicPathSchema.safeParse(path);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'invalid_path' };
  if (RESERVED_PREFIXES.some((p) => path === p.replace(/\/$/, '') || path.startsWith(p.endsWith('/') ? p : `${p}/`))) {
    return { ok: false, error: 'reserved_path' };
  }
  if (path.startsWith('/category/') || path.startsWith('/languages/') || path.startsWith('/news/')) {
    return { ok: false, error: 'gone_prefix' };
  }
  return { ok: true };
}

export function slugFromPath(path: string): string {
  if (path === '/') return 'home';
  return path.split('/').filter(Boolean).pop() || path;
}
