# Phase 17 — SEO metadata

Source of truth: `packages/seo/src/metadata.ts` via `resolveMetadata()`.

Astro `SiteLayout` resolves title, description, H1, and canonical for **every** public page. Inner templates use the same resolver for the visible H1.

## Method

No Search Console export exists in the repo. Titles were chosen from the page’s actual job (utility / informational / navigational). No search-volume numbers were invented.

## Rules

- Brand suffix `| Alshafra` is added after a content-first title.
- Home, about, and contact keep Alshafra in the core title.
- `تقويم السعودية` is stripped if it appears as a brand suffix. It is not used as the site name.
- Country gold/USD pages get a patterned title (`سعر الذهب اليوم في مصر`).
- Validation rejects generic titles, missing H1, thin descriptions, and old-brand suffixes.

## Intent examples

| Path | Intent | Topic |
|---|---|---|
| `/date-converter` | utility | تحويل التاريخ |
| `/salaries` | informational | مواعيد الرواتب |
| `/tools` | navigational | الأدوات |
| `/gold-price/egypt` | informational | أسعار الذهب |
