# Phase 4 ADRs (401–406)

Phase 0 ADRs 001–020, Phase 1 ADR-101–116, Phase 2 201–207, Phase 3 301–303 remain in force.

## ADR-401 Database Access Strategy

**Decision:** Versioned SQL migrations + Zod row schemas. No Prisma. `@alshafra/database` is the only SQL gateway. Local tests use PGlite; hosted target is Supabase Postgres.

**Why:** Phase 1 stack table rejected “Prisma required”. Serverless-friendly, reviewable SQL, no heavy ORM.

**Trade-off:** Less convenience than Prisma migrate; more control.

## ADR-402 Legacy Content Migration

**Decision:** Idempotent ETL from legacy JSON into `documents`/`routes`/`tools`. Astro default `ALSHAFRA_CONTENT_SOURCE=composite` keeps legacy HTML and uses DB for parity/snapshot.

**Why:** Zero URL regression; strangler pattern.

## ADR-403 Analytics Storage

**Decision:** `analytics_events` append-only + `page_view_daily` / `content_metrics` / `tool_metrics` foundations. No raw IP. No invented counts.

## ADR-404 Content Entity Model

**Decision:** Keep Phase 1 names (`documents`, `document_revisions`, `document_seo`, `document_tags`). Add Phase 4 `entities` + `document_entities` and normalize `sources` + `document_sources`. `content_types` table labels the enum.

**Conflict:** Phase 4 prompt said `content_versions` / `seo_metadata` / `content_tags`. Phase 1 already named these. Phase 1 wins; mapping documented.

## ADR-405 Soft Delete Policy

Unchanged from Phase 1 §04 table. Applied in SQL.

## ADR-406 Migration Runtime

**Decision:** Do not claim production Supabase apply from this environment. PGlite proves SQL + import + parity. Operators apply the same files to Supabase when credentials exist.
