# 47 — Migrations Strategy

- Tool: **Supabase CLI** `supabase/migrations/YYYYMMDDHHMMSS_name.sql`.  
- Forward-only preferred; expand/contract for column renames.  
- Review in PR.  
- No destructive drop of `documents.path` uniqueness.  
- Seeds: `supabase/seed.sql` roles, flags, tools, 410 redirects — not fake people.  
- Content import is a **job**, not a SQL dump of HTML from prerender (see `63`).

Rollback: restore DB from backup + previous Pages deployment. Down-migrations not required for v1 if backups exist (free tier: **no PITR** — see free-tier risks).
