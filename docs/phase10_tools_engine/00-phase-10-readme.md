# Phase 10 — Tools engine (chat مرحلة 12)

New tools register through `@alshafra/tools` and publish at **`/tool/:slug`**. Legacy calendar/market tools stay on their old paths. No live scrape inside page render.

## Shipped now (`client_compute`)

percentage, discount, BMI, loan installment, unit converter, word counter, UUID, Base64, URL encode, JSON format, plus hub `/tools`.

JSON-LD `WebApplication` applies to `/tool/*` and `island: 'tool'`. Sitemap bucket is `tools`. Header/footer/home link to `/tools`.

## Deferred (need files / YMYL sources)

PDF merge/split/compress, image tools, zakat calculator.

## Adding another tool

1. Engine function in `packages/tools/src/engines.ts` + test.
2. Row in `NEW_TOOLS` with unique `/tool/...` path.
3. Case in `ToolIsland`.
4. Do not collide with the 127 legacy URLs.
