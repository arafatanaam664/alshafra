# 04 — `daily-publish.yml` before merging to `main`

This session branch **does not change** `.github/workflows/daily-publish.yml`.

Reason: the GitHub App used here cannot update workflow files (`workflows` permission denied). Scheduled Actions still run from **`main`**, which still has the old Vite-root paths — that is correct for production today.

## Do this in the merge-to-main PR (not now)

1. Point scripts at `apps/web-legacy/`.
2. Build the public site with `npm run build` (Astro). Keep `npm run build:legacy` only as a rollback job.
3. Run the job only on `main`.

Required job header and commands:

```yaml
jobs:
  publish:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    timeout-minutes: 25
    steps:
      # …checkout, Node 22, npm ci…
      - run: node apps/web-legacy/scripts/fetch-prices.mjs
      - run: node apps/web-legacy/scripts/fetch-trending.mjs
      - run: npm run build:legacy
      # git add:
      #   apps/web-legacy/src/data/prices.json
      #   apps/web-legacy/src/data/trending-snapshot.json
      #   apps/web-legacy/public/published.json
      #   apps/web-legacy/public/4f9c2a7e1b8d3f6a9c0e5b7d2a8f4c1e.txt
      - run: node apps/web-legacy/scripts/indexnow.mjs
```

Merging this branch into `main` **without** that update will break the daily price refresh, because `scripts/fetch-prices.mjs` no longer exists at the repo root.
