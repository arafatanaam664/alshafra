# Phase 15 — Production cutover audit (re-verification)

Date: 2026-08-24  
Branch: `arena/01a02128-alshafra` @ `8731aa3`  
Method: read the repository. The Phase 14 report was treated as a starting list, not as truth.

Status key: **CONFIRMED** still present · **PARTIAL** present with nuance · **FIXED ALREADY** in code before this phase · **NOT CONFIRMED** · **DEFERRED** out of Phase 15

| # | Finding (from Phase 14) | Still present? | Evidence | Cause | Priority | Phase 15? | Defer reason |
|---|---|---|---|---|---|---|---|
| 1 | Live `main` is still the Vite calendar site | CONFIRMED | `origin/main` at `62464df` (`chore: refresh prices…`). This branch is not merged. | Owner lock: merge only when complete. | P0 | No (process) | Merge/DNS are owner actions. |
| 2 | `.github/workflows/daily-publish.yml` still uses Vite-root paths | CONFIRMED | Workflow runs `node scripts/fetch-prices.mjs` and commits `src/data/prices.json`. Those paths exist only under `apps/web-legacy/`. | Workflow was never cut over. This App cannot update `.github/workflows/*`. | P0 | Document + patch file | GitHub App `workflows` permission denied. Ready YAML: `docs/execution/15-daily-publish.yml`. |
| 3 | CMS publish does not update the live visitor page | CONFIRMED | `packages/cms/src/site-publish.ts` writes `cms-snapshot.json` (or `ALSHAFRA_SNAPSHOT_PATH`) and stores `site.last_publish`. No deploy hook, no snapshot upload, no build trigger. Astro is `output: 'static'`. | Snapshot ≠ Vercel rebuild. A deploy hook without a reachable snapshot still rebuilds the old git file. | P0 | Yes | — |
| 4 | Production admin login is not configured | PARTIAL | `handleAdminApi` already refuses `ADMIN_DEV_LOGIN` when `ALSHAFRA_ENV === 'production'` and returns 501. Hole: production is detected only via `ALSHAFRA_ENV`, not `VERCEL_ENV`. Email-only login still works if `ALSHAFRA_ENV` is unset. No Supabase token verify path. | Adapter is a stub (`packages/auth/src/index.ts`). | P0 | Yes | Hosted Supabase project remains an owner secret. |
| 5 | 127 HTML outputs were not verified in the last audit turn | CONFIRMED (at start of this phase) | `apps/web/dist` is not present until `npm run build`. Inventory JSON is 127 (`apps/web/public/published.json` and `apps/web-legacy/public/published.json`). | Audit turn had no install/build. | P0 | Yes — build + HTML probe | — |
| 6 | Role `admin` is missing read permissions the UI needs | CONFIRMED | `packages/database/src/seed.ts` `ROLE_PERMS[IDS.roleAdmin]` has `flags.toggle` / `settings.write` / `documents.publish` but not `documents.read`, `documents.update`, `flags.read`, `settings.read`, `health.read`, `users.read`. `getDashboardOverview` requires `documents.read`. `listFlags` requires `flags.read`. Super admin bypasses via `hasPermission`. | Seed list was write-heavy and never paired with the matching reads. | P1 | Yes | — |
| 7 | Feature flags do not control public navigation | CONFIRMED | Snapshot already stores `flags` (`export-snapshot.ts`). Public nav (`apps/web/src/content/sections-public.ts`) uses catalog/overrides only. `navSections()` filters `enabled && hasPublicPage && showInNav`. `featureFlag` on a section is unused at read time. | Two sources of truth were never joined. | P1 | Yes | 127 HTML paths must stay up even if a section is hidden. |
| 8 | Analytics beacon posts to an admin-only API | CONFIRMED | `AnalyticsBeacon` POSTs `/api/v1/public/events`. Handler lives in `handlePublicApi`, mounted only by `apps/admin/server/vite-plugin.ts`. Astro is static. `vercel.json` has no function. | No public ingest adapter on the static host. | P1 | Yes | Storage still needs `DATABASE_URL` (owner). Endpoint must exist either way. |
| 9 | `unique_sessions` is not a real unique count | CONFIRMED | `packages/analytics/src/ingest.ts` inserts `unique_sessions = 1` then `ON CONFLICT … SET views = views + 1` and never updates uniques. Beacon generates a new `sessionHash` on every page load. Dashboard already returns `uniqueVisitors: null`. | Incomplete increment + unstable session id. | P1 | Yes | Do not invent unique visitors. |
| 10 | Admin session cookie missing `Secure` | CONFIRMED | `encodeCookie` in `packages/cms/src/session.ts`: `Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`. No `Secure`. | Cookie helper is environment-blind. | P1 | Yes | Development may omit `Secure` for localhost. |
| 11 | `docs/execution/01-gap-matrix.md` is stale | CONFIRMED | Still says public search is **M**, media is schema-only, community is tables-only, structured data is WebPage only. Phases 7–13 shipped on this branch. | Written in Phase 0/5 and not revised. | P1 | Yes — update in place | Keep history. |
| 12 | Content editor is raw JSON blocks | CONFIRMED | `apps/admin/src/pages/views.tsx` textarea for `body_json`. | Scoped as P2 editor UX. | P2 | No | Not required to cut over the beachhead. |
| 13 | Some community tables unused | CONFIRMED | `packages/community/src` has no bookmarks/follows/mentions/badges modules. | Engine is gated off. | P2 | No | Community stays off. |
| 14 | Google Fonts CDN | CONFIRMED | `SiteLayout.astro` loads fonts.googleapis.com. | Performance, not a cutover blocker. | P3 | No | Self-host later. |
| 15 | hreflang incomplete | PARTIAL | `hreflangAlternates()` is called from `SiteLayout`. Multi-language public UI is not a Phase 15 goal. | Product decision: Arabic beachhead only. | P3 | No | Do not add 16 locales. |
| 16 | Calendar country model incomplete | CONFIRMED | Gold/USD country pages exist; no general country IA. | Out of scope. | P3 | No | Do not generate thin country pages. |
| 17 | `getSitePublishStatus` skips permission if any actor exists | CONFIRMED | `if (!actor) requirePermission(...)` — authenticated users with no publish/read still get status. | Incomplete guard. | P1 | Yes | Related to publish honesty. |
| 18 | `robots.txt` uses internal language | CONFIRMED | `apps/web/public/robots.txt` comment: “previous incarnation”. | Crawler-visible planning language. | P1 | Yes | Visible to users/crawlers. |
| 19 | Static 404/410 titles still say «تقويم السعودية» | CONFIRMED | `apps/web/public/404.html`, `410.html`. Not part of the 127 inventory. Homepage already uses Alshafra. | Leftover Vite error pages. | P1 | Yes | Brand on error pages only. Do not rewrite 127 titles. |
| 20 | Production Postgres client does not exist | CONFIRMED | `getAdminDb()` always opens PGlite. `@alshafra/database` has no remote driver. | Hosted DB was deferred (owner D4). | P0/P1 | Partial | Endpoint + adapter; live storage waits for `DATABASE_URL`. |
| 21 | Admin nav marks Social/Automation as “soon” while pages exist | CONFIRMED | `Shell.tsx` `soon: true`; `App.tsx` already routes `/social`, `/automation`. | Leftover label. | P2 | Yes (wire existing pages) | Not a new product section. |
| 22 | Root `typecheck` omits social + notifications | CONFIRMED | `package.json` `typecheck` script. | Oversight. | P2 | Yes | Tiny, in scope of control-plane honesty. |

## Contract chosen for flags vs navigation

Do not collapse these four facts into one boolean in storage:

1. **sectionEnabled** — CMS/catalog `enabled` (human/IA decision).
2. **flagEnabled** — `feature_flags[section.featureFlag]`. Missing key does **not** hide a beachhead section.
3. **publicPageAvailable** — `hasPublicPage` in code. Cannot be forced true from CMS.
4. **navigationVisible** — `sectionEnabled && flagEnabled && publicPageAvailable && showInNav`.

The 127 legacy URLs are generated from `published.json` + `provider.ts`, not from nav. Turning a flag off hides the section from header/home/footer. It must not 404 `/today`, `/salaries`, or any other inventory path.

## Publish vs live (current vs target)

Current: Admin → DB → JSON snapshot file → (nothing).

Target for this phase:

```
SAVE (draft)
→ REVIEW
→ PUBLISH (DB status + best-effort snapshot)
→ SNAPSHOT (explicit site-publish)
→ optional UPLOAD (ALSHAFRA_SNAPSHOT_PUT_URL)
→ optional DEPLOY (ALSHAFRA_DEPLOY_HOOK_URL)
→ USER (only after a production build that read the new snapshot)
```

The UI must not say the live site is updated unless upload and deploy both succeeded.

## What this phase will not do

- Open jobs, scholarships, opportunities, community, travel, comparisons, apps, AI, news, ads, email, or real social OAuth.
- Rewrite 127 inner titles that contain «تقويم السعودية».
- Delete `apps/web-legacy`.
- Change DNS or merge `main`.
- Commit secrets.
- Edit `.github/workflows/*` in this App (patch file instead).
