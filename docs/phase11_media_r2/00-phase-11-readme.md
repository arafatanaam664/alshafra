# Phase 11 — Media / R2 (chat مرحلة الوسائط)

Editorial images go through `@alshafra/media`. Postgres stores metadata only. Bytes go to a `StorageProvider`.

## Drivers

| Driver | When |
|---|---|
| `memory` | tests (`MEDIA_DRIVER=memory`) |
| `local` | default without R2 keys (`.data/media`, gitignored) |
| `r2` | when `R2_ACCOUNT_ID` + access key + secret + `R2_BUCKET` are set |

No live scrape. No secrets in the repo. Public pages never use `localhost` for media.

## Pipeline

1. MIME sniff + size/dimension caps (8MB / 6000px). SVG banned. PDF deferred.
2. SHA-256. Same hash reuses the existing row.
3. JPEG APP1/EXIF stripped.
4. Object key `media/{yyyy}/{mm}/{uuid}/original.{ext}`.
5. Variant **plan** recorded (`thumbnail/medium/large/og`). Transcode to WebP/AVIF waits for a worker + R2.
6. Soft delete now; GC after 30 days if nothing references the row.

## Admin

`/media` can upload, preview, and soft-delete. Status endpoint reports whether R2 is configured — never returns secrets.

## Owner action (later, before launch)

See `01-owner-r2-setup.md`. Put keys in Vercel / `.env.local`. Do not paste them in chat.
