# 08 — Build and Deployment

| Command | App |
|---|---|
| `npm run dev` | Astro |
| `npm run dev:legacy` | Vite |
| `npm run build` | Astro → `apps/web/dist` |
| `npm run build:legacy` | Vite prerender → `apps/web-legacy/dist` |

**Production origin (2026-08-21): Vercel.** It must run `npm run build:legacy` and publish `apps/web-legacy/dist` (`vercel.json`).

Netlify is leftover and is aligned to the same Vite command/folder so it cannot ship empty Astro output.

Cloudflare Pages + DNS cutover wait until the owner says the project is complete.

`daily-publish.yml` is unchanged on this branch (GitHub `workflows` permission). Update it when merging to `main` — see `docs/execution/04-daily-publish-cutover.md`.

No DNS change.
