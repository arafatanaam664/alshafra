# Phase 2 — Repository Architecture

**Status:** COMPLETE  
**Date:** 2026-08-21  
**Principle:** ONE modular monolith. Packages are **code boundaries**, not services.

Upstream: `docs/product_architecture/` (Phase 0), `docs/technical_architecture/` (Phase 1).

## Conflict with Phase 1 (documented, Phase 1 intent kept)

Phase 1 H3: public app is **Astro**.  
Phase 2 constraint: do not delete the Vite + prerender site until a replacement passes SEO tests.

**Decision (ADR-203):** `@alshafra/web` **is** the public site and still **Vite + prerender**. Astro is the target renderer and is **not installed** in this phase. Calendar math **is** extracted to `@alshafra/calendar` so Astro islands can import the same package later.

## Read order

`01` tree → `04` packages → `17` migration → `19` graph → `25` summary
