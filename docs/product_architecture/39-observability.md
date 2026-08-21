# 39 — Observability

| Stream | Where |
|---|---|
| Error logs | Worker/Pages logs + optional Sentry later (flag) |
| Application logs | structured JSON, no secrets |
| Audit logs | DB |
| Job logs | `jobs` + `job_attempts` |
| Social logs | per job |
| Health | `/health` JSON: db, r2, last price snapshot age, flags hash |
| Perf | Web Vitals sampled (GA or internal) |

Admin System Health page consumes `/health`.

Do not log full social tokens or emails in plaintext beyond what auth vendor stores.
