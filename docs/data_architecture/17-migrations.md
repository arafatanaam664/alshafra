# 17 — Migrations

Versioned SQL in `packages/database/migrations/YYYYMMDDHHMMSS_name.sql`.

Applied by `applyMigrations()` into `schema_migrations`. Forward-only. Expand/contract for renames.

Do not drop `documents.path` uniqueness.

Hosted apply: operator uses Supabase CLI / SQL editor. Phase 4 CI uses PGlite only — **do not claim production migration succeeded**.
