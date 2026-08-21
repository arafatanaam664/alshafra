# 16 — Search

## Provider

```ts
interface SearchProvider {
  index(doc: SearchDocument): Promise<void>;
  remove(path: string): Promise<void>;
  query(q: SearchQuery): Promise<SearchResult>;
  suggest(prefix: string, locale: string): Promise<string[]>;
}
class PostgresSearchProvider implements SearchProvider
```

Later Meilisearch implements the same.

## Query pipeline

1. Strip tashkeed, normalize alef/taa marbuta (kernel `normalizeArabic`).  
2. Synonyms replace (`search_synonyms`).  
3. `plainto_tsquery('simple', ...)` + prefix last token.  
4. Rank: ts_rank + type boost (tools 1.2, articles 1.1) + recency mild.  
5. Filter indexable only.

## `/search`

SSR, `noindex,follow`, no pagination bombs (`page` max 20). Rate limit.

## Analytics

Insert `search_queries` with normalized query + length + result_count. Roll up `popular_searches`.

## Suggestions

`popular_searches` ∪ document title prefix (trigram if available). Boost legacy tool names.

## What is indexed

Published indexable documents + active tools + indexable UGC only.
