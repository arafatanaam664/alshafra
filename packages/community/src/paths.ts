export const QUESTION_PREFIX = '/question';

export function slugifyTitle(title: string): string {
  const slug = title
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return slug.slice(0, 80) || 'question';
}

export function questionPath(id: string, slug: string): string {
  return `${QUESTION_PREFIX}/${id}/${slugifyTitle(slug)}`;
}

export function parseQuestionPath(path: string): { id: string; slug: string } | null {
  const match = path.match(/^\/question\/([0-9a-f-]{36})(?:\/([^/]+))?$/i);
  if (!match) return null;
  return { id: match[1], slug: match[2] || '' };
}

export function isCommunityPath(path: string): boolean {
  return path === QUESTION_PREFIX || path.startsWith(`${QUESTION_PREFIX}/`);
}

export function reservedCommunityPath(path: string): boolean {
  return (
    path.startsWith('/category/') ||
    path.startsWith('/languages/') ||
    path.startsWith('/news/') ||
    path.startsWith('/articles/') ||
    path.startsWith('/admin')
  );
}
