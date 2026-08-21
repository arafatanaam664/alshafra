# 11 — Phase 3 Decisions

## ADR-301 Astro static public site (supersedes ADR-203 *renderer*, not production cutover)

**Context:** Phase 2 kept Vite until SEO tests.  
**Decision:** Astro 5 `output: 'static'` is the **verified** public renderer (127 routes, titles, canonicals, h1). Vite remains **deployed** via `build:legacy` until an explicit cutover.  
**Alternatives:** Replace Vite immediately; SSR adapter.  
**Why:** Static-first, CF Pages, islands.  
**Trade-offs:** Two apps to maintain briefly.  
**Consequences:** Do not delete `apps/web-legacy` yet.

## ADR-302 LegacyContentProvider

JSON files behind one module. No database.

## ADR-303 Homepage TRANSFORM

`/` uses Alshafra identity; calendar is a section with links to preserved URLs.
