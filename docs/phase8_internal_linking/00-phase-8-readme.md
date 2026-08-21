# Phase 8 — Internal linking engine (chat مرحلة 10)

Deterministic related-content graph. Replaces ad-hoc `relatedHtml` lists.

## Rules implemented

1. Manual CMS relations (`manual-links.json` + `document_relations`) always first.
2. Cluster mates: أم القرى، الرواتب، الدراسة، الإجازات.
3. Gold country ↔ USD same country.
4. Countdown → matching tool/article.
5. Token overlap (Arabic-normalized), max 6 auto, type diversity.
6. Never auto-link `noindex` or gone prefixes.
7. Hubs (`/articles`, `/countdown`, `/trending`, gold/USD indexes) give inbound links.
8. `orphanPaths()` lists indexable URLs with zero inbound (excluding `/`).

## Files

- `packages/content/src/linking.ts`
- `packages/content/src/manual-links.ts`
- `apps/web/src/components/RelatedLinks.astro`
- `apps/web/src/data/manual-links.json`

## Out of scope

Community questions, ML recommendations, Meilisearch, changing the 127 URLs.
