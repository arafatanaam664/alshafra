# 17 — Media Pipeline

```
Upload (multipart, auth)
  → MIME allowlist + size + dimensions
  → Re-encode (strip EXIF by default)
  → Variants
  → R2 put
  → media + media_variants rows
```

## Allowlist (editorial)

`image/jpeg`, `image/png`, `image/webp`, `image/gif` (no SVG from users). PDF later for real calendar file (`application/pdf`) editor-only, scanned size cap.

## Limits (start)

| | Editorial | UGC (future) |
|---|---|---|
| Max bytes | 8 MB | 1 MB |
| Max px | 6000 | 2000 |
| SVG | no | no |

**NEEDS VERIFICATION** vs R2 free 10GB — keep caps low.

## Variants

| key | max width | format |
|---|---|---|
| original | as uploaded, max 2000 w for raster | webp or original pdf |
| thumbnail | 320 | webp |
| medium | 768 | webp |
| large | 1280 | webp |
| social / og | 1200×630 crop | jpg/webp |

AVIF optional later if CPU allows on worker (10ms CPU free Workers — **process at upload on a queue job**, not on Pages Function hot path).

## EXIF

Strip GPS. Keep orientation then strip.

## Dedupe

If sha256 exists, reuse media id (new reference).
