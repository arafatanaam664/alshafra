# 05 — SEO Model

`document_seo` is 1:1 with `documents` (not a disconnected `seo_metadata` service).

Fields: seo_title, meta_description, canonical_url, robots (`robots_directive`), og_*, twitter_* (nullable; default to og), schema_type, schema_json, h1_override.

Title policy (H2): use `seo_title` if set, else `title`. **Never** auto-append `| Alshafra`. Import copies `published.json` titles into `seo_title`.

Canonical: `https://alshafra.com{path}`.

`indexable` is stored on `documents`. Import sets true for the 127 published URLs. UGC tables default `indexable=false`.

410/301 live in `redirects`, not by reusing `/category/*`, `/languages/*`, `/news/*`.
