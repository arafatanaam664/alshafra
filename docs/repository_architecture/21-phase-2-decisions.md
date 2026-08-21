# 21 — Phase 2 Decisions (ADRs)

## ADR-201 Monorepo tool

**Decision:** npm workspaces.  
**Alternatives:** pnpm, yarn, turborepo.  
**Why:** existing lockfile + `npm ci` in GitHub Actions.  
**Trade-offs:** no pnpm strictness.  
**Consequences:** `package-lock.json` at root.

## ADR-202 Package build

**Decision:** consume TypeScript source via `exports` → `src/index.ts`. No per-package `dist`.  
**Why:** simplest; Vite already bundles.  
**Trade-offs:** consumers must use bundler resolution.

## ADR-203 Apps structure

**Decision:** `apps/web` = current Vite public app; `apps/admin` = shell. Astro not installed.  
**Why:** preserve 127 URL prerender.  
**Trade-offs:** Phase 1 H3 delayed.  
**Consequences:** documented in 00.

## ADR-204 Calendar boundary

**Decision:** `@alshafra/calendar` owns Hijri + weekend rule. App re-exports.  
**Why:** Phase 1 rule 20.  
**Trade-offs:** two files until events data moves.

## ADR-205 Shared UI

**Decision:** `@alshafra/ui` tokens only; no component dump.  
**Why:** avoid empty component theater.

## ADR-206 Database access

**Decision:** `@alshafra/database` conventions only; no Supabase client yet.  
**Why:** Phase 2 is not the DB phase.

## ADR-207 Testing location

**Decision:** fast tests in `tests/` and `tools/`; package unit tests later colocated.  
**Why:** 127 URL check does not belong inside calendar.
