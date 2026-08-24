# Phase 15 — Production readiness

Date: 2026-08-24  
Branch: `arena/01a02128-alshafra`

## Verdict

**D — Blocked by external dependency** for a live cutover of `alshafra.com`.

The beachhead **code** on this branch is ready to preview: Astro static site, 127/127 HTML generated, control plane hardened, tests green. Shipping to the live origin still needs owner actions this App cannot perform.

## Beachhead that may be previewed

- التقويم والمواعيد
- الأدوات
- الأدلة
- المقالات

Future sections remain off.

## DoD checklist

| Item | Status |
|---|---|
| A Architecture (Astro public, Vite admin, Vite legacy kept) | Met |
| B Auth (dev login local only; production refuses it) | Met in code. Hosted Supabase project is owner-owned. |
| C RBAC (admin reads work; editor/moderator limited; visitor 401) | Met |
| D Feature flags control public nav; 127 URLs stay up | Met |
| E SAVE / REVIEW / PUBLISH / SNAPSHOT / DEPLOY honesty | Met in code. Live deploy needs owner hook + snapshot URL. |
| F Daily publish works with the monorepo | **Blocked** — YAML written, workflow file not updated (no `workflows` permission). |
| G 127/127 HTML verified | Met — `docs/execution/15-127-url-verification.md` |
| H No planning-language leak; 127 titles not rewritten | Met |
| I Analytics endpoint exists; no PII; no fake unique sessions | Met. Storage needs `DATABASE_URL`. |
| J Tests actually run and pass | Met |
| K Docs match the repo | Met |

## Owner actions before merge

1. Apply `docs/execution/15-daily-publish.yml` over `.github/workflows/daily-publish.yml`.
2. Set `ADMIN_SESSION_SECRET`. Never commit it.
3. Optional for live CMS→visitor: `ALSHAFRA_SNAPSHOT_URL`, `ALSHAFRA_SNAPSHOT_PUT_URL`, `ALSHAFRA_DEPLOY_HOOK_URL`.
4. Optional for stored analytics / production staff login: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
5. Merge only when you decide the project is complete. Do not change DNS from this branch.

## What must stay off

jobs, scholarships, opportunities, community, travel, comparisons, apps, AI, news, ads, email, real social OAuth.
