# @alshafra/database

Central PostgreSQL access for the Alshafra modular monolith.

## Rules

- Apps must not open Postgres/Supabase clients ad hoc.
- `service` clients (service role) are server-only.
- SQL migrations in `migrations/` are the schema source of truth.
- No Prisma. Typed access = SQL + Zod row schemas (Phase 1 / ADR-401).
- IDs are UUIDv7 generated in `@alshafra/kernel`.

## Local

```
npm run data:migrate
npm run data:seed
npm run data:import
```

Local tests use PGlite (embedded Postgres). Production/staging use Supabase. Phase 4 does **not** apply migrations to a live Supabase project from this repo unless `DATABASE_URL` / Supabase CLI is configured by an operator.

## Layout

| Path | Role |
|---|---|
| `migrations/*.sql` | Versioned schema |
| `src/migrate.ts` | Apply migrations |
| `src/seed.ts` | Roles, flags, types, 410 rules |
| `src/schema.ts` | Zod contracts |
| `src/access.ts` | Browser vs service boundaries |
