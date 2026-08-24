# Phase 15 — External blockers

These are real and cannot be finished from this App. They are not used as an excuse to skip code that can be fixed.

## 1. GitHub Actions workflow file

- **Problem:** `.github/workflows/daily-publish.yml` still uses Vite-root paths.
- **Cause:** this GitHub App cannot update `workflows` files.
- **Evidence:** `docs/execution/04-daily-publish-cutover.md`; current workflow calls `node scripts/fetch-prices.mjs`.
- **Impact:** merging this branch to `main` without the patch breaks the daily gold/FX refresh.
- **Options:** apply `docs/execution/15-daily-publish.yml` in a workflow-capable PR; or keep `main` on Vite until that PR lands.
- **Recommended:** copy the YAML into `.github/workflows/daily-publish.yml` in the merge-to-main PR.
- **Needs owner?** Yes, or anyone with `workflows` permission.

## 2. Merge to `main` / DNS

- **Problem:** live `alshafra.com` is still the Vite site.
- **Cause:** owner lock — merge only when the project is complete; do not change DNS.
- **Impact:** this branch can be production-shaped and still not be the public origin.
- **Needs owner?** Yes.

## 3. Hosted database and production admin auth

- **Problem:** production admin cannot log in until Supabase (or another production auth) is configured. Analytics events are accepted but not stored without `DATABASE_URL`.
- **Cause:** owner decision D4 — no secrets in chat; hosted DB later.
- **Evidence:** `ADMIN_DEV_LOGIN` is now hard-blocked in production. `createSqlClientFromEnv()` returns null without `DATABASE_URL`.
- **Impact:** beachhead HTML can still ship statically. Control plane on a hosted URL waits for secrets.
- **Needs owner?** Yes — set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ADMIN_SESSION_SECRET`, optional `DATABASE_URL`. Never paste them in chat.

## 4. Live publish loop

- **Problem:** writing `cms-snapshot.json` locally does not update visitors.
- **Cause:** Astro is static. Vercel rebuilds git (or a remote snapshot URL).
- **Fix in this phase:** snapshot + optional `ALSHAFRA_SNAPSHOT_PUT_URL` + `ALSHAFRA_SNAPSHOT_URL` + `ALSHAFRA_DEPLOY_HOOK_URL`. UI does not claim live.
- **Needs owner?** Yes — create the deploy hook and snapshot store. Do not commit the hook URL.
