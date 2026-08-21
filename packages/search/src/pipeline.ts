import { normalizeArabic, tokenize } from './normalize';
import { expandWithSynonyms } from './synonyms';

export interface PreparedQuery {
  raw: string;
  normalized: string;
  expanded: string;
  tokens: string[];
  prefix: string | null;
  tsQuery: string;
}

export function prepareQuery(raw: string, synonymPairs?: [string, string][]): PreparedQuery {
  const clipped = String(raw ?? '').slice(0, 80);
  const normalized = normalizeArabic(clipped).toLowerCase();
  const expanded = expandWithSynonyms(normalized, synonymPairs);
  const tokens = tokenize(expanded);
  const prefix = tokens.length ? tokens[tokens.length - 1] : null;
  const tsQuery = tokens
    .map((token, index) => (index === tokens.length - 1 ? `${token}:*` : token))
    .filter(Boolean)
    .join(' & ');
  return { raw: clipped, normalized, expanded, tokens, prefix, tsQuery };
}

export function typeBoost(kind: string, path: string): number {
  if (['/date-converter', '/hijri-calendar', '/salaries', '/today'].includes(path) || path.startsWith('/tool/')) return 1.25;
  if (kind === 'tool' || kind === 'gold' || kind === 'usd' || path.startsWith('/countdown/')) return 1.2;
  if (kind === 'article' || kind === 'guide' || kind === 'solution') return 1.1;
  if (kind === 'calendar_content') return 1.15;
  return 1;
}
