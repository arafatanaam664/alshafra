# 49 — Phase 1 Readiness

Phases 1–5 are now implemented in the working tree (see `docs/execution/`). This file keeps the original human-decision table and records the 2026-08-21 answers.

## Phase 1 should be

1. Freeze and prerender remaining linked URLs (`/name-decoration*`) or unlink them.
2. Implement 410 on the **actual** production host.
3. Port domain engines (Hijri, weekend rule, countdowns, prices) as framework-agnostic modules.
4. Choose public renderer (ADR-004 spike) that emits static HTML for articles/tools.
5. Stand up Supabase + CMS for the 7 articles + core pages **without URL changes**.
6. Settings + feature flags + redirect registry.
7. New homepage at `/` (after brand decision).
8. SEO module: sitemap index, robots consistency, SearchAction removed or made real.
9. Measurement: GSC, Bing, GA.
10. Stop git-as-CMS for prices optionally via worker, without dropping daily snapshots.

## Phase 1 must not be

- Community launch
- Social auto-publish
- 16-language rollout
- Microservices
- URL prefix migration
- Database schema as a substitute for this spec (schema comes **after** Phase 0, in Phase 1)

## Human approvals

| ID | Decision | Status (2026-08-21) |
|---|---|---|
| H1 | Public brand | **A** — Alshafra primary; calendar is pillar 8 |
| H2 | Title suffix on HIGH calendar URLs | **Keep** `published.json` titles until a later human pass |
| H3 | Frontend | **Astro + React islands** (done in Phases 1–3) |
| H4 | Production host cutover | **Stay on Vercel.** Cloudflare only when the project is complete |
| H5 | Catalog languages | Pause public catalog |
| H6 | `/trending/today` index | Unchanged |
| H7 | Monthly salary URLs | Default: do not create |
| H8 | AdSense | Gated (`ads_enabled` false) |
| H9 | Product scope | **All 7 chat ideas + calendar as #8** |

## Exit criteria from Phase 0

- [x] Legacy audit
- [x] URL inventory
- [x] SEO preservation plan
- [x] Vision + IA + content model
- [x] CMS/community/tools/search/social/queue/media specs
- [x] ADRs, risks, unknowns
- [x] Diagrams
- [x] Self-review file
- [x] Human answers H1–H4 and H9 (H2 = keep titles)

## What an engineer should read on day 1 of Phase 1

`00`, `01`, `02`, `03`, `06`, `09`, `10`, `40`, `45`, `46`, `49`, `54`, `56`
