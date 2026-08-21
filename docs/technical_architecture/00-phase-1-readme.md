# Phase 1 — Technical Foundation

**Status:** COMPLETE (blueprint only — no production features)  
**Date:** 2026-08-21  
**Product:** Alshafra (`https://alshafra.com`)  
**Upstream:** `docs/product_architecture/` (Phase 0) is the product/SEO/migration source of truth.

This folder is the **implementable technical contract**. After Phase 1, an engineer can build database, auth, Astro, URL compatibility, and content/tools foundations **without inventing architecture**.

---

## Locked human decisions (H1–H4)

| ID | Decision |
|---|---|
| **H1 Brand** | Public brand is **Alshafra**. Calendar is a **section**, not a separate brand. UI may say «Alshafra — التقويم والمواعيد». Do **not** use «تقويم السعودية» as the primary product name. Keep it as `alternateName` in schema for entity continuity. |
| **H2 Titles** | Do **not** auto-append `\| Alshafra` to every title. Intent-first titles. Brand suffix only when it fits length and does not weaken keywords. |
| **H3 Frontend** | **Astro + React islands + TypeScript**. Not Next.js. |
| **H4 Hosting** | **Cloudflare Pages + Supabase + R2**. No new Vercel dependency. |

These override Phase 0 ADR-004’s “spike between Astro and Next” and ADR-002’s pending brand wording.

---

## How this relates to the current repo

| Topic | Source of truth |
|---|---|
| Live routes, files, engines, published.json | **Current code** |
| Product direction, IA, SEO, flags, migration actions | **Phase 0** |
| Stack, schema, API, RLS, Astro, Cloudflare | **This folder (Phase 1)** |

**Documented conflict:** the repo is still a Vite SPA with Vercel/Netlify configs. Phase 1 **does not migrate code**. It specifies the replacement. Until cutover, production 410 rules remain an ops gap (Phase 0 R14).

---

## Read order for implementers

1. This file  
2. `01-system-architecture.md`  
3. `03-module-boundaries.md`  
4. `05-database-schema.md`  
5. `11-url-architecture.md` + `12-legacy-route-compatibility.md` + `62-legacy-route-regression-matrix.md`  
6. `19-authentication.md` + `20-authorization.md` + `07-database-rls.md`  
7. `21-api-architecture.md` + `22-api-contracts.md`  
8. `41-frontend-architecture.md` + `42-astro-islands.md`  
9. `39-calendar-domain.md` + `40-tools-platform.md`  
10. `55-phase-1-decisions.md` + `57-phase-1-readiness.md`

---

## What Phase 1 is / is not

**Is:** schemas, contracts, interfaces, module boundaries, ERD, RLS, tests design, migration *plan*, ADRs 101–116.

**Is not:** CMS UI, community launch, OAuth social apps, full admin, DNS cutover, deleting legacy Vite, changing any of the 127 URLs.

Optional repo scaffolding (only if needed later): empty `packages/` folders. **Not created in this phase** to avoid a fake implementation.

---

## Document map

Files `00`–`58` as specified, plus:

- `59-domain-events.md`
- `60-dependency-graph.md`
- `61-architecture-rules.md`
- `62-legacy-route-regression-matrix.md`
- `63-content-migration-plan.md`
- `64-quality-gates.md`
- `65-diagrams.md`
- `66-self-review.md`
