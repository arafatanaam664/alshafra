# 22 — Social Sharing (on-page)

## Buttons (public content)

- Facebook
- X
- Telegram
- WhatsApp
- Native `navigator.share` when available
- Copy link

No tracking pixels required for share **buttons**. Optional `share` / `copy_link` / `social_click` events.

## Metadata

Every indexable page:

- `og:type` website|article
- `og:title` `og:description` `og:url` `og:image` (1200×630) `og:locale=ar_SA` `og:site_name`
- `twitter:card=summary_large_image` and matching title/description/image

Image: featured → generated social card → default `og-image`.

## UGC

Sharing allowed; OG must not look like official editorial if the page is noindex community (or use a generic card). Prefer not to generate unique OG for noindex pages.
