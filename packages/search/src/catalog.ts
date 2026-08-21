import { fuzzyMatch } from './fuzzy';
import { tokenize } from './normalize';
import { prepareQuery, typeBoost } from './pipeline';
import { DEFAULT_SYNONYMS } from './synonyms';
import {
  SEARCH_MAX_PAGE,
  SEARCH_PAGE_SIZE,
  type SearchDocument,
  type SearchHit,
  type SearchProvider,
  type SearchQuery,
  type SearchResult,
} from './types';

export const EDITORIAL_SUGGESTIONS = [
  'تحويل التاريخ',
  'مواعيد الرواتب',
  'ام القرى',
  'التقويم الهجري',
  'حساب المواطن',
  'الإجازات الرسمية',
  'التقويم الدراسي',
];

export function scoreDocument(doc: SearchDocument, tokens: string[], prefix: string | null): number {
  const hay = `${doc.title} ${doc.h1 || ''} ${doc.description || ''} ${doc.body || ''}`;
  const hayTokens = new Set(tokenize(hay));
  let score = 0;
  for (const token of tokens) {
    if (hayTokens.has(token)) score += 2;
    else if ([...hayTokens].some((item) => item.startsWith(token))) score += 1.2;
    else if ([...hayTokens].some((item) => fuzzyMatch(token, item))) score += 0.6;
  }
  if (prefix && tokenize(doc.title).some((item) => item.startsWith(prefix))) score += 1.5;
  return score * typeBoost(doc.kind || '', doc.path);
}

export class CatalogSearchProvider implements SearchProvider {
  constructor(
    private documents: SearchDocument[],
    private synonymPairs: [string, string][] = DEFAULT_SYNONYMS,
    private recorded: { query: string; count: number }[] = [],
  ) {}

  async search(query: SearchQuery): Promise<SearchResult> {
    const prepared = prepareQuery(query.q, this.synonymPairs);
    const pageSize = Math.min(query.limit ?? SEARCH_PAGE_SIZE, 50);
    const page = Math.min(Math.max(query.page ?? 1, 1), SEARCH_MAX_PAGE);
    if (!prepared.tokens.length) {
      return { hits: [], total: 0, page, pageSize, normalized: prepared.normalized };
    }
    const ranked = this.documents
      .map((doc) => ({ doc, score: scoreDocument(doc, prepared.tokens, prepared.prefix) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score);
    const total = ranked.length;
    const start = (page - 1) * pageSize;
    const hits: SearchHit[] = ranked.slice(start, start + pageSize).map((row) => ({
      path: row.doc.path,
      title: row.doc.h1 || row.doc.title,
      description: row.doc.description,
      kind: row.doc.kind,
      score: Number(row.score.toFixed(3)),
    }));
    await this.record(prepared.normalized, total);
    return { hits, total, page, pageSize, normalized: prepared.normalized };
  }

  async suggest(prefix: string): Promise<string[]> {
    const prepared = prepareQuery(prefix, this.synonymPairs);
    if (!prepared.normalized) return EDITORIAL_SUGGESTIONS.slice(0, 6);
    const fromTitles = this.documents
      .map((doc) => doc.h1 || doc.title)
      .filter((title) => tokenize(title).some((token) => prepared.tokens.some((q) => token.startsWith(q) || q.startsWith(token))));
    const editorial = EDITORIAL_SUGGESTIONS.filter((item) => tokenize(item).some((token) => prepared.tokens.some((q) => token.startsWith(q))));
    return [...new Set([...editorial, ...fromTitles])].slice(0, 8);
  }

  async record(query: string, resultCount: number): Promise<void> {
    if (query) this.recorded.push({ query, count: resultCount });
  }

  getRecorded() {
    return this.recorded;
  }
}
