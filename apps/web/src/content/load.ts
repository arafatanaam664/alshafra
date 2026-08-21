import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const DATA = join(here, '../../../web-legacy/src/data');
export const PUBLISHED = join(here, '../../public/published.json');

export function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}

export function loadPublished(): { path: string; title: string; kind: string }[] {
  const data = readJson<{ published: { path: string; title: string; kind: string }[] }>(PUBLISHED);
  return data.published;
}

export interface RouteSnapshot {
  path: string;
  title: string;
  h1: string;
  description: string;
  robots: 'index, follow' | 'noindex, follow';
  canonicalUrl: string;
  documentType: string;
  status: string;
  handlerKind: string;
  indexable: boolean;
}

export function loadContentSnapshot(): { routes: RouteSnapshot[] } | null {
  const candidates = [
    join(here, '../data/cms-snapshot.json'),
    join(here, '../../../../packages/database/data/content-snapshot.json'),
  ];
  for (const file of candidates) {
    try {
      const data = readJson<{ routes: RouteSnapshot[] }>(file);
      if (data?.routes) return data;
    } catch {
      /* try next */
    }
  }
  return null;
}

export function contentSource(): 'legacy' | 'database' | 'composite' {
  const v = process.env.ALSHAFRA_CONTENT_SOURCE;
  if (v === 'legacy' || v === 'database' || v === 'composite') return v;
  return 'composite';
}
