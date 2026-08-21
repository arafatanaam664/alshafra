# 13 — Legacy Migration

Strangler import, not a rewrite.

```
legacy JSON → parser → normalizer → Zod/SQL constraints → PostgreSQL
```

Idempotent: upsert by `documents.path`, `routes.path`, `tools.key`, `countdown_definitions.slug`.

## Mapping

| Source | Target |
|---|---|
| published.json | routes + document_seo.seo_title |
| articles.json | documents type=article + faq + sources |
| core-guides.json | body_json on tool/legal/collection pages |
| countdowns.json | countdown_definitions + tool_page documents |
| trending.json topics | documents type=guide |
| trending hubs/categories | documents type=collection |
| prices.json | price_snapshots + gold/usd tool pages |
| LEGACY_TOOLS | tools rows |
| SAUDI events / salary programs | calendar_events / calendar_programs |

Skip: i18n catalog, trivia/world, name-decoration as indexable URL.

Rollback: keep Vite `apps/web-legacy` deploy; Astro still builds from legacy HTML if snapshot is missing (`ALSHAFRA_CONTENT_SOURCE=composite`).
