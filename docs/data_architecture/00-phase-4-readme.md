# 00 — Phase 4 README

**Data & Content Foundation.** Modular monolith, one PostgreSQL database, no microservices.

## What this phase is

Move from JSON + `LegacyContentProvider` toward:

```
Supabase PostgreSQL → @alshafra/database → @alshafra/content → ContentProvider → Astro (static-first)
```

with a **safe fallback** to legacy JSON HTML so the 127 published URLs never go dark.

## What this phase is not

No CMS UI, admin dashboard, forum, OAuth, social publishing, automation workers, email, AI, 16 languages, jobs/scholarships/travel products, recommendation engine, or Meilisearch/Algolia.

## Commands

```
npm run data:migrate
npm run data:seed
npm run data:import
npm run test:data
```

Local verification uses **PGlite** (embedded Postgres). Hosted Supabase is not applied from CI in this phase.

## Docs index

| File | Topic |
|---|---|
| 01–07 | Database / entities / content / users / SEO / media / tools |
| 08–11 | Analytics, events, flags, audit |
| 12–17 | Routes, legacy import, seed, RLS, indexes, migrations |
| 18–22 | Retention, dashboard vision, acceptance, risks, summary |
