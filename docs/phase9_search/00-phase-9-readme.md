# Phase 9 — Public search (chat مرحلة 11)

`/search?q=` is live, **`noindex, follow`**.

## Pipeline

1. Strip tashkeed, normalize alef / taa marbuta / alif maqsura.
2. Expand editorial synonyms (`أم القرى` ↔ `ام القرى` ↔ `umm al qura`).
3. Prefix last token.
4. Rank with type boosts (tools > calendar > articles).
5. Light typo tolerance (edit distance 1 on tokens ≥ 4).
6. Record normalized query + result count (`search_queries` / `popular_searches` when Postgres exists).

## Providers

| Provider | When |
|---|---|
| `CatalogSearchProvider` | Astro static site (build-time index `/search-index.json`) |
| `PostgresSearchProvider` | Hosted/local Postgres FTS (`search_tsv`) |

Same `SearchProvider` interface. Meilisearch later.

## SEO

`WebSite.potentialAction` is now a real `SearchAction` targeting `/search?q={search_term_string}`. `/search` stays out of the sitemap.
