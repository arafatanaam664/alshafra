# 03 — Apps

| App | Name | Role | Status |
|---|---|---|---|
| `apps/web` | `@alshafra/web` | Public website | **Production** Vite SPA + prerender (127 URLs) |
| `apps/admin` | `@alshafra/admin` | Staff shell | Foundation: layout + `@alshafra/auth` / `@alshafra/ui` hooks. No CMS. |

Both may import domain packages. Neither talks to Postgres directly.

Future: `apps/web` becomes Astro; `apps/worker` for cron (Phase 1). Not created now.
