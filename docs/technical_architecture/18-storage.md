# 18 — Storage (R2)

## Bucket

One bucket `alshafra-media` (name via env `R2_BUCKET`). Public read via custom domain `media.alshafra.com` **or** Pages `/cdn-cgi` later. **Decision:** public objects via `https://media.alshafra.com/{key}` when DNS ready; until then Worker signed GET or R2.dev for preview only (noindex).

## Key convention

```
media/{yyyy}/{mm}/{uuid}/{variant}.{ext}
```

Example: `media/2026/08/0191…/og.webp`

Not `media/{entity}/…` — entity is in DB. Year/month for ops listing.

Private: `private/{uuid}/{variant}` — not public ACL.

## Metadata

Only in Postgres `media`. R2 object metadata: `sha256`, `variant` for repair.

## Secrets

`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` — names only.

## Cleanup job

`media.gc`: delete R2 objects for `deleted_at < now()-30d` with no document references.
