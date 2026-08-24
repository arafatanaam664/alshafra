# 04 — `daily-publish.yml` before merging to `main`

This session **attempts** to keep `.github/workflows/daily-publish.yml` aligned with `docs/execution/15-daily-publish.yml`. If GitHub rejects the workflow file, the copy in `docs/execution/` remains the source to apply by hand.

Reason: the GitHub App used here cannot update workflow files (`workflows` permission denied). Scheduled Actions still run from **`main`**, which still has the old Vite-root paths — that is correct for production today.

The exact replacement lives in `docs/execution/15-daily-publish.yml`.

## What the live workflow does today (Vite root on `main`)

1. `node scripts/fetch-prices.mjs` → `src/data/prices.json`
2. `node scripts/fetch-trending.mjs` → `src/data/trending-snapshot.json`
3. `npm run build` (Vite prerender)
4. commit those JSON files plus `public/published.json` and the IndexNow key
5. `node scripts/indexnow.mjs`

## What the Astro monorepo needs after merge

Astro reads prices from `apps/web-legacy/src/data/prices.json` (`apps/web/src/content/load.ts` → `DATA`). The fetch scripts already write next to themselves, so the only required change is the path prefix.

1. Point scripts at `apps/web-legacy/`.
2. Build the public site with `npm run build` (Astro). Keep `npm run build:legacy` only as a rollback job.
3. Commit `apps/web-legacy/src/data/prices.json` and `apps/web-legacy/src/data/trending-snapshot.json`.
4. Do **not** require regenerating `published.json` — that file is the 127-URL inventory, not a daily artifact.
5. Run the job only on `main`.

Merging this branch into `main` **without** applying `docs/execution/15-daily-publish.yml` will break the daily price refresh, because `scripts/fetch-prices.mjs` no longer exists at the repo root.
