# Alshafra

Arabic RTL-first platform (`https://alshafra.com`). **Modular monolith** — one product, one primary Postgres later, workspace packages as boundaries (not microservices).

The public product is **Alshafra**. The live calendar cluster (تقويم السعودية) is **pillar 8**, not a second website.

## What this repo is

One platform that will host **all eight pillars** from the product decision (2026-08-21):

1. حلول ومعلومات عملية
2. أدوات + محتوى
3. دليل تقني للمشاكل والحلول
4. وظائف ومنح وفرص
5. ترندات وأسئلة الجمهور
6. سفر وأماكن وتجارب
7. مقارنة منتجات وخدمات
8. التقويم والمواعيد (الموقع الحي الحالي)

Architecture is built for all eight now. Public content is activated per pillar with feature flags. Do not publish thin hubs.

Details: `docs/product_architecture/56-eight-pillars.md` and `docs/execution/03-owner-decisions.md`.

## Apps

| Package | Role |
|---|---|
| `@alshafra/web` | Public site — **Astro 5** static + React islands (not production origin yet) |
| `@alshafra/web-legacy` | Vite + prerender — **current production** on Vercel |
| `@alshafra/admin` | Staff CMS (Vite + React). Dev HMAC login only until Supabase exists |

## Production (do not guess)

- **Live host today:** Vercel serving `apps/web-legacy/dist`.
- **Build that Vercel must run:** `npm run build:legacy` (locked in `vercel.json`).
- **Not yet:** Cloudflare Pages, hosted Supabase, R2. Those come after the project is complete enough to cut over. Do not change DNS.
- `npm run build` is the Astro app. Pointing Vercel/Netlify at it while `outputDirectory`/`publish` is still the Vite folder will ship an empty site.

## Docs

- `docs/product_architecture/` — Phase 0 (vision, IA, 127 URLs)
- `docs/technical_architecture/` — Phase 1
- `docs/repository_architecture/` — Phase 2
- `docs/application_foundation/` — Phase 3
- `docs/data_architecture/` — Phase 4
- `docs/cms_architecture/` — Phase 5
- `docs/execution/` — audit, gap matrix, master plan, owner decisions

`PROJECT.md` describes the **old root Vite app** only. Prefer the folders above.

## Commands

```
npm install
npm run dev            # Astro public site
npm run dev:legacy     # Vite production clone
npm run dev:admin      # CMS (ADMIN_DEV_LOGIN for local staff emails)
npm run typecheck
npm run lint
npm run test
npm run build          # Astro → apps/web/dist
npm run build:legacy   # Vite prerender → apps/web-legacy/dist
npm run build:admin
```

Node `>=22` (see `.nvmrc`). npm `10.9.8`. Do not commit `.env`. Do not paste secrets in chat.

## Hard rules

- Keep the 127 published URLs. Never reuse `/category/*`, `/languages/*`, `/news/*` (410 Gone).
- UGC default noindex. No AI-bulk pages. No thin programmatic catalog.
- Calendar math stays in `@alshafra/calendar` (pure — no DB, no React).
- Service-role keys never go in the browser.
- Merge this session branch to `main` only when the owner says the project is complete.
