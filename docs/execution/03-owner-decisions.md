# 03 — Owner decisions (2026-08-21)

Recorded from the product owner. Source of truth order is still: repo/tests → ADRs/docs → chat → suggestions.

| ID | Question | Decision |
|---|---|---|
| D1 | Product scope | **All seven chat ideas + the live calendar site as idea 8.** One platform. See `docs/product_architecture/56-eight-pillars.md`. |
| D2 | Where is production? | **Vercel now.** Move to Cloudflare Pages only when the project is complete enough to cut over. |
| D3 | Commit Phases 0–5? | **Yes, on this branch** `arena/01a02128-alshafra`. Merge to `main` only when the owner says the whole project is ready. |
| D4 | Supabase / R2 / Cloudflare Pages | **Later, not now.** Do not ask for keys in chat. Never commit secrets. |
| D5 | Public name | **Alshafra.** Calendar is a section (pillar 8). «تقويم السعودية» is `alternateName`, not the company name. |
| D6 | Title suffix on HIGH pages | **Superseded 2026-08-24.** Public titles use content-first search queries and the Alshafra name. «تقويم السعودية» and «شفرة تولز» stay out of visible titles. |
| D7 | DNS | **Do not change.** |

## Consequences for engineering

- Public renderer is **Astro** (chat). This branch publishes `apps/web/dist`.
- Live `main` stays Vite until you merge. Host stays Vercel until Cloudflare cutover. No DNS change.
- Daily auto-publish stays the `main` Vite-root workflow until merge. The required `apps/web-legacy` + `build:legacy` patch is documented in `04-daily-publish-cutover.md` (this App cannot update `.github/workflows`).
- Hosted database and R2 wait for a later milestone. Local CMS uses PGlite / `ADMIN_DEV_LOGIN`.
- Implementing “all eight ideas” means architecture + sequenced activation, not eight indexed empty hubs.

## Still open

- First *new* editorial cluster after calendar (default: solutions + digital-service how-tos, after CMS→HTML).
