# 06 — Media Model

`media` = metadata (bucket, object_key, mime, byte_size, width/height, alt, caption, credit, sha256, visibility). Bytes stay on R2 later.

`media_variants`: original, thumbnail, medium, large, social, og.

Phase 4 does **not** upload to R2. Default OG remains `public/og-image.jpg` on the Astro app.
