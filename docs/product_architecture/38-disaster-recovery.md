# 38 — Disaster Recovery

| Asset | Backup | Restore |
|---|---|---|
| Postgres | Supabase automatic + scheduled dump to R2 | Point-in-time if plan allows; else dump |
| R2 media | Versioning / replicate later | Re-publish URLs from metadata table |
| Settings/flags | In Postgres, thus dumped | |
| Git repo | GitHub | Code only; not content after CMS |
| Audit logs | Append-only table, dump | Do not prune aggressively |
| Redirect/410 list | Postgres + exported file in git optional | |

RPO/RTO are not contracted on $0. Document actual Supabase free backup retention when connecting (**NEEDS VERIFICATION** at Phase 1).

Never have CMS content exist only in memory or only on a laptop.

Media recovery: metadata in DB is source of keys; blobs in R2.

## Incidents

If Umm Al-Qura ICU unavailable at build: fail closed or use last known month-length snapshot — do not silently switch to tabular without labeling.
