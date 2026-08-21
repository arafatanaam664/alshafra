# 15 — Build System

Order: packages are source (no build) → `apps/web` Vite → `scripts/prerender.mjs`.

Cloudflare Pages: root `npm run build`, publish `apps/web/dist` (same as Netlify `publish` now).

Admin build is separate (`build:admin`) and not production.

No Turborepo.
