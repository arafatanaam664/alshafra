import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';
import { prepareQuery } from './pipeline';
import { DEFAULT_SYNONYMS } from './synonyms';
import { EDITORIAL_SUGGESTIONS } from './catalog';
import {
  SEARCH_MAX_PAGE,
  SEARCH_PAGE_SIZE,
  type SearchProvider,
  type SearchQuery,
  type SearchResult,
} from './types';

export class PostgresSearchProvider implements SearchProvider {
  constructor(private db: SqlClient) {}

  private async synonymPairs(): Promise<[string, string][]> {
    try {
      const rows = await this.db.query<{ term: string; synonym: string }>(
        'SELECT term, synonym FROM search_synonyms',
      );
      const pairs = rows.rows.map((row) => [row.term, row.synonym] as [string, string]);
      return pairs.length ? pairs : DEFAULT_SYNONYMS;
    } catch {
      return DEFAULT_SYNONYMS;
    }
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    const pairs = await this.synonymPairs();
    const prepared = prepareQuery(query.q, pairs);
    const pageSize = Math.min(query.limit ?? SEARCH_PAGE_SIZE, 50);
    const page = Math.min(Math.max(query.page ?? 1, 1), SEARCH_MAX_PAGE);
    if (!prepared.tsQuery) {
      return { hits: [], total: 0, page, pageSize, normalized: prepared.normalized };
    }
    const offset = (page - 1) * pageSize;
    const result = await this.db.query<{ path: string; title: string; excerpt: string | null; type: string; rank: number }>(
      `SELECT path, title, excerpt, type::text AS type,
              ts_rank(search_tsv, to_tsquery('simple', $1)) AS rank
       FROM documents
       WHERE deleted_at IS NULL AND status = 'published' AND indexable = true
         AND (search_tsv @@ to_tsquery('simple', $1)
              OR title_normalized ILIKE '%' || $2 || '%'
              OR coalesce(body_normalized,'') ILIKE '%' || $2 || '%')
       ORDER BY rank DESC, published_at DESC NULLS LAST
       LIMIT $3 OFFSET $4`,
      [prepared.tsQuery, prepared.normalized, pageSize, offset],
    );
    const count = await this.db.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM documents
       WHERE deleted_at IS NULL AND status = 'published' AND indexable = true
         AND (search_tsv @@ to_tsquery('simple', $1)
              OR title_normalized ILIKE '%' || $2 || '%')`,
      [prepared.tsQuery, prepared.normalized],
    );
    const total = count.rows[0]?.n ?? result.rows.length;
    await this.record(prepared.normalized, total);
    return {
      hits: result.rows.map((row) => ({
        path: row.path,
        title: row.title,
        description: row.excerpt ?? undefined,
        kind: row.type,
        score: Number(row.rank),
      })),
      total,
      page,
      pageSize,
      normalized: prepared.normalized,
    };
  }

  async suggest(prefix: string): Promise<string[]> {
    const prepared = prepareQuery(prefix);
    if (!prepared.normalized) return EDITORIAL_SUGGESTIONS.slice(0, 6);
    const rows = await this.db.query<{ title: string }>(
      `SELECT title FROM documents
       WHERE deleted_at IS NULL AND status = 'published' AND indexable = true
         AND title_normalized ILIKE $1
       ORDER BY published_at DESC NULLS LAST
       LIMIT 8`,
      [`%${prepared.normalized}%`],
    );
    return [...new Set([...EDITORIAL_SUGGESTIONS.filter((item) => item.includes(prefix)), ...rows.rows.map((r) => r.title)])].slice(
      0,
      8,
    );
  }

  async record(query: string, resultCount: number): Promise<void> {
    if (!query) return;
    await this.db.query(
      `INSERT INTO search_queries (id, query_normalized, query_length, result_count)
       VALUES ($1,$2,$3,$4)`,
      [newId(), query, query.length, resultCount],
    );
    await this.db.query(
      `INSERT INTO popular_searches (query_normalized, locale, hit_count)
       VALUES ($1,'ar',1)
       ON CONFLICT (query_normalized, locale)
       DO UPDATE SET hit_count = popular_searches.hit_count + 1, updated_at = now()`,
      [query],
    );
  }
}
