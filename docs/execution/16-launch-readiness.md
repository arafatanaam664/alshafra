# Phase 16 — Launch readiness

Date: 2026-08-24  
Branch: `arena/01a02128-alshafra` @ `2bab5b7` plus this phase’s commits  
Public renderer: Astro `apps/web` → `apps/web/dist`

## A — VERIFIED

| Item | Status | Evidence | Blocker? |
|---|---|---|---|
| Branch / HEAD | VERIFIED | `arena/01a02128-alshafra` | No |
| Live origin still `main` Vite | VERIFIED | `origin/main` `c414e09` daily Vite refresh | External |
| Astro is this branch’s public site | VERIFIED | `vercel.json` `outputDirectory: apps/web/dist`, `npm run build` | No |
| Vite legacy kept | VERIFIED | `apps/web-legacy` present | No |
| 127/127 HTML | VERIFIED | `npm run test:astro`, `node tools/verify-127-dist.mjs` | No |
| Extra public pages | VERIFIED | about/contact/privacy/terms/faq/calendar/tools/search/404/410 | No |
| No visible old brand | VERIFIED | scripts stripped; only JSON-LD `alternateName` | No |
| Production rejects `ADMIN_DEV_LOGIN` | VERIFIED | Phase 15 + 16 tests | No |
| Preview ≠ production | VERIFIED | `VERCEL_ENV=preview` is not production | No |
| Secure cookie in production | VERIFIED | HttpOnly Secure SameSite=Lax | No |
| RBAC admin reads | VERIFIED | dashboard/flags/settings/health/users | No |
| Future flags off | VERIFIED | community/jobs/scholarships/opportunities/travel/comparisons/ai/ads/news/apps | No |
| Beachhead flags on | VERIFIED | calendar/tools/trends | No |
| Publish does not claim live | VERIFIED | `publishSite().live === false` without hook+upload | No |
| Analytics honest | VERIFIED | PII rejected; unique sessions not invented; 202 `stored:false` without DB | No |
| No repo secrets | VERIFIED | no `.env` files; only empty `.env.example` names | No |
| 410 routes | VERIFIED | vercel.json + netlify.toml | No |
| Tests / build / typecheck | VERIFIED | see section Tests | No |

## B — FIXED in this phase

- Static `404.html` / `410.html` colors aligned with Alshafra (no leftover calendar teal).
- `pull-snapshot.mjs` refuses to overwrite the repo snapshot unless `routes` is an array.
- Launch tests: preview auth policy, beachhead flags, no secret leak in `auth/status`.
- Public-page verifier beyond the 127.
- Attempted to update `.github/workflows/daily-publish.yml`. GitHub refused the App (`workflows` permission). The monorepo YAML remains in `docs/execution/15-daily-publish.yml`.

## C — REMAINING

- Hosted Supabase staff login (needs owner keys).
- `DATABASE_URL` if you want stored analytics.
- Snapshot upload + deploy hook if CMS publish should reach visitors.
- Merge to `main` and DNS stay owner-owned.

## D — EXTERNAL ACTIONS

1. Confirm `.github/workflows/daily-publish.yml` on GitHub matches `docs/execution/15-daily-publish.yml` (this App may be denied `workflows` permission).
2. Set Vercel env: `ADMIN_SESSION_SECRET`. Optional: `ALSHAFRA_ENV=production`, snapshot/deploy URLs, `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
3. Merge this branch when you decide the project is complete. Do not change DNS from here.

## E — BLOCKERS

Code: none critical.  
Cutover: workflow permission (maybe), secrets, merge.

## F — SAFE TO LAUNCH?

**CODE READY. EXTERNAL CUTOVER REQUIRED.**

Beachhead (calendar + tools + guides + articles) may ship as the public Astro site after the owner applies workflow + env + merge.

## G — EXACT LAUNCH PROCEDURE

1. Confirm GitHub Actions file on the default branch uses `apps/web-legacy/scripts/fetch-prices.mjs` and `npm run build` (Astro). If this PR could not update workflows, copy `docs/execution/15-daily-publish.yml` with a workflows-capable account.
2. In Vercel: Root = repo root, install `npm ci`, build `npm run build`, output `apps/web/dist`. Already encoded in `vercel.json`.
3. Set `ADMIN_SESSION_SECRET`. Never commit it.
4. Optional CMS live loop: `ALSHAFRA_SNAPSHOT_URL`, `ALSHAFRA_SNAPSHOT_PUT_URL`, `ALSHAFRA_SNAPSHOT_TOKEN`, `ALSHAFRA_DEPLOY_HOOK_URL`.
5. Optional admin production login: `SUPABASE_URL` + `SUPABASE_ANON_KEY`. Dev login stays off in production.
6. Merge `arena/01a02128-alshafra` → `main` when you accept the cutover.
7. Watch the first Vercel build and the next scheduled daily-publish run.
8. Spot-check `/`, `/today`, `/date-converter`, `/salaries`, `/privacy`, a 410 URL.

Do not start Phase 17 from this App.
