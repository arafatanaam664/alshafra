# Supabase

Schema source of truth: `packages/database/migrations/`.

This folder exists so operators can use the Supabase CLI later:

```
supabase db reset   # after copying or linking migrations
```

Phase 4 does **not** push to a hosted Supabase project from CI. Local verification uses PGlite (`npm run test:data`).

Never put service-role keys in the frontend or in git.
