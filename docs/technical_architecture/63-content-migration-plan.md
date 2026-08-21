# 63 — Content Migration Plan (do not execute now)

## ETL

1. **Extract** JSON: `articles.json`, `core-guides.json`, `countdowns.json`, `trending.json`, `events.ts` schedules, `prices.json` last snapshot, `published.json` paths.  
2. **Transform** to `documents` + `tools` + `routes` + `faq_items` + `sources`. Preserve **path**. Status `published`. `legacy_path` = path. `published_at` from reviewedAt/updatedAt. Body from sections → `body_json`.  
3. **Validate** every published.json path has a `routes` row; count 127. Canonical host. No duplicate paths.  
4. **Load** in a transaction per family.  
5. **Verify** SEO tests 48.

## Mapping

| Legacy | Target |
|---|---|
| articles.json | documents type=article |
| core-guides | body/blocks on tool_page documents |
| countdowns | countdown_definitions + documents tool_page + tools |
| trending topics | documents type=guide path `/trending/:slug` |
| categories trending | documents type=collection |
| gold/usd | tools + documents tool_page |
| legal pages | documents type=legal |
| `/` | documents type=collection or static — homepage may be code+modules not a document; **still a routes row** |
| i18n catalog | **skip** |
| name-decoration | tools + pages; add routes even if not in published.json |

## URL counts

`before = 127` from published.json. `after` must be 127 × 200. Any extra (name-decoration) documented. Any missing = **blocker**.

Images: current site has almost none besides og-image — copy `public/og-image.jpg` to R2 as default.

Rollback: keep Vite deploy live until Astro passes 127 tests on preview.
