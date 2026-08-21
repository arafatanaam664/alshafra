export interface SearchDocument {
  path: string;
  title: string;
  h1?: string;
  description?: string;
  body?: string;
  kind?: string;
  locale?: string;
}

export interface SearchQuery {
  q: string;
  locale?: string;
  limit?: number;
  page?: number;
}

export interface SearchHit {
  path: string;
  title: string;
  description?: string;
  kind?: string;
  score?: number;
}

export interface SearchResult {
  hits: SearchHit[];
  total: number;
  page: number;
  pageSize: number;
  normalized: string;
}

export interface SearchProvider {
  search(query: SearchQuery): Promise<SearchResult>;
  suggest(prefix: string, locale?: string): Promise<string[]>;
  index?(doc: SearchDocument): Promise<void>;
  remove?(path: string): Promise<void>;
  record?(query: string, resultCount: number): Promise<void>;
}

export const SEARCH_PAGE_SIZE = 10;
export const SEARCH_MAX_PAGE = 20;
