# 08 — Build and Deployment

| Command | App |
|---|---|
| `npm run dev` | Astro |
| `npm run dev:legacy` | Vite |
| `npm run build` | Astro → `apps/web/dist` |
| `npm run build:legacy` | Vite prerender → `apps/web-legacy/dist` |

**Renderer (this branch):** Astro — `npm run build` → `apps/web/dist`.  
**Host today:** Vercel. **Later:** Cloudflare Pages. No DNS change.

Vite remains `npm run build:legacy` → `apps/web-legacy/dist` (rollback only).

`daily-publish.yml` is unchanged on this branch (GitHub `workflows` permission). Update it when merging to `main` — see `docs/execution/04-daily-publish-cutover.md`.
