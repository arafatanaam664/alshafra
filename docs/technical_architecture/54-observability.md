# 54 — Observability

- `request_id` on every API response and log line.  
- Structured JSON logs: `level, request_id, module, msg` — no tokens.  
- `/health` — process up  
- `/ready` — can SELECT 1 from Postgres + R2 head + last prices age < 48h  
- Job failures: `jobs.last_error` + admin + notification to admins  
- Audit: 05  
- Optional Sentry later (`SENTRY_DSN`) flag  

Do not implement dashboards in Phase 1 beyond the contract.
