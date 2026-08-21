# 18 — Search Architecture

## Phase 1

**PostgreSQL Full Text Search** (Supabase), Arabic-aware as far as Postgres config allows.

- `tsvector` generated column on Content and indexable UGC.
- Normalization: strip tashkeed, alef variants, taa marbuta/haa (application layer).
- Prefix: `:*` on last token for typeahead.
- Ranking: `ts_rank` + boosts (type, recency, manual weight, click-through later).

## UI

`/search?q=` — **noindex, follow**.  
Does **not** replace the fake `SearchAction` until it works. Then update JSON-LD target to `/search?q={search_term_string}`.

## Suggestions

- Popular searches table (aggregated, privacy-preserving).
- Editorial synonyms (`أم القرى` ↔ `ام القرى` ↔ `Umm Al-Qura`).
- Tool names and legacy titles boosted.

## Analytics

Events: `search` with query hash/length, result count, clicked path.  
Do not store raw PII in queries.

## Later swap

Interface `SearchProvider`:

- `PostgresSearchProvider` (default)
- `MeilisearchProvider` / `OpenSearchProvider` later

Domain code talks to the interface only.

## Arabic limitations (known)

Postgres Arabic stemming is imperfect. Document this; do not pretend it is Elasticsearch. Synonyms and normalization are mandatory.

## What is indexed

Editorial published + indexable tools + indexable UGC only. Drafts never.
