export interface SearchDocument {
  path: string;
  title: string;
  body?: string;
  locale?: string;
}

export interface SearchQuery {
  q: string;
  locale?: string;
  limit?: number;
}

export interface SearchHit {
  path: string;
  title: string;
  score?: number;
}

export interface SearchProvider {
  search(query: SearchQuery): Promise<{ hits: SearchHit[] }>;
  suggest(prefix: string, locale?: string): Promise<string[]>;
  index(doc: SearchDocument): Promise<void>;
  remove(path: string): Promise<void>;
}

export function normalizeArabic(input: string): string {
  return input
    .normalize('NFC')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();
}
