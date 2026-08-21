# 53 — Disaster Recovery (technical)

| Asset | Backup | RPO note |
|---|---|---|
| Postgres | Nightly `pg_dump` to R2 `backups/db/` | Free: no PITR — **RPO ~24h** |
| R2 | Object versioning if available; else metadata in DB + dump | **NEEDS VERIFICATION** versioning on free |
| Settings/flags | in DB dump | |
| Git | GitHub | code + this spec |
| Audit | in DB dump; do not prune < 1y if disk allows |

Restore: new Supabase project → restore dump → point env → Pages rollback.

Calendar ICU fail: see 39.

Do not store CMS-only in git after import.
