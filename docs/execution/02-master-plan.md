# 02 — Master Execution Plan (from current repo → production)

Do not start all systems. Sequence by dependency and SEO risk.

## Milestone 0 — Stabilize (this cycle)

**Goal:** Make the current working tree durable and non-suicidal to deploy.  
**Why first:** Uncommitted Phases 0–5 + host mismatch can destroy both new work and the live site.  
**Depends on:** owner commit + host answers (received 2026-08-21).  
**In:** git hygiene, README, Vercel/Netlify lock to Vite, eight-pillar lock, do **not** change DNS.

- Commit Phase 0–5 on this branch (no reset/clean).
- Lock Vercel to `npm run build:legacy` + `apps/web-legacy/dist`; add 410 routes.
- Align Netlify command/publish on the same Vite folder.
- Document the `daily-publish.yml` path/`build:legacy` update for the future merge to `main` (cannot edit workflows from this App; see `04-daily-publish-cutover.md`).
- Align README with admin/CMS + eight pillars.
- Keep production on Vite/Vercel until a dedicated cutover milestone.

**Acceptance:** commit on `arena/01a02128-alshafra`; host-config test green; docs match the owner decisions.

**Deferred:** cutover, Supabase, R2, community, deleting Vite.

---

## Next after M0 (do not start until the owner says ابدأ المرحلة التالية)

**Milestone 1 — Publish pipeline (CMS → static site)** remains the dependency for adding new pillar pages without editing JSON by hand.

A visible homepage TRANSFORM for the eight pillars can follow immediately after M1, or be a thin M1b on Vite if the owner wants the live Vercel site to say Alshafra sooner. Production stays Vite until cutover.

---

## Milestone 1 — Publish pipeline (CMS → static site)

**Goal:** A published document can appear as a static public page **without** breaking 127.  
**Why:** CMS is a closed loop today.  
**Depends on:** M0.

- Snapshot/rebuild path after publish (build-time, not SSR every request).
- New CMS URLs opt-in to sitemap only after quality gate.
- 127 regression remains required.

**Blocked later by:** hosted DB only if we want live prod CMS.

---

## Milestone 2 — Production identity (Supabase + secrets)

**External:** you create a Supabase project and add env vars in the host.  
**In-repo:** apply migrations, replace HMAC-only admin login with Supabase Auth for staff, never put service role in the browser.

Can proceed with other in-repo work if you delay this; **prod CMS login stays 501**.

---

## Milestone 3 — Astro cutover (preview first)

- Preview host serves `apps/web/dist`.
- Compare 127 vs live Vite.
- Then DNS/Pages cutover. Leave Vite as rollback.

**Do not** do this in the same commit as a Netlify publish-path experiment.

---

## Milestone 4 — SEO completeness

- Richer JSON-LD where true (FAQ/Article/WebApplication).
- Vercel 410 parity **or** drop Vercel after CF cutover.
- Title policy on remaining `published.json` strings (human decision).
- Search UI `/search` noindex.

---

## Milestone 5 — Analytics beacon (honest)

- `page_view` / `tool_used` / `share` to BFF → `analytics_events`.
- Dashboard shows real zeros until traffic exists.
- 90-day retention job later.

---

## Milestone 6 — Media + R2

**External:** R2 bucket + keys.  
Upload pipeline, variants metadata, default OG.

---

## Milestone 7 — Public search + internal linking v1

Postgres FTS + Arabic normalize. Related links from entities/topics.

---

## Milestone 8 — Opportunity research / first expansion cluster

**Editorial, not code-first.** Use Bing/GSC data. Do not spray Technology/Travel/Jobs.

---

## Milestone 9 — Community (flags still default off until ready)

Only after staff CMS + moderation basics + Turnstile.

---

## Milestone 10 — Social publishing adapters

**External:** Telegram bot, Meta, X apps. Queue worker. Isolated from document status.

---

## Milestone 11 — Automation + notifications

Trigger/condition/action on the existing tables.

---

## Milestone 12 — Monetization / ads slots

Only with real slot IDs. `ads_enabled` stays false until then.

---

## Milestone 13 — AI assist (never auto-publish)

After content volume + human review.

---

## What stays deferred until data says go

Jobs, scholarships, travel verticals, 16 languages, Meilisearch, recommendations ML, deleting Vite.

---

## External inputs (from you, never paste secrets in chat)

| Need | Blocks |
|---|---|
| Commit/push permission (already on this branch) | M0 durability |
| Confirm current production host (Netlify vs Vercel vs other) | M0/M3 |
| Supabase project | M2 prod CMS |
| R2 | M6 |
| Cloudflare Pages + DNS when ready | M3 |
| GSC/Bing/AdSense tokens if changing | SEO |
| Social app credentials | M10 |
| Title/brand rewrite of remaining HIGH titles | Editorial |
