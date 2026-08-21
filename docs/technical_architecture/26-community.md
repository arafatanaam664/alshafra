# 26 — Community (schema ready, flag off)

`community_enabled` default **false**. Tables exist; routes 404 if flag off.

## Visibility

| status | Public HTML | Index |
|---|---|---|
| open | yes if flag | no unless gate |
| hidden | no | no |
| deleted_at set | 404 | no |

## SEO eligibility

`questions.indexable` default false. Job `ugc.quality_evaluate` may **propose**; SEO Manager or strict rule (`answers >= 1` AND length AND not spam AND unique) can set true. Default rule: **never auto-index in v1** even if scores pass — `seo.ugc_auto_index` flag default false.

Canonical: self when indexable; else noindex.

## Soft delete

Questions/answers/comments: `deleted_at`. Votes: hard delete.

## URLs

`/question/{uuid}/{slug}` — lookup by id; slug mismatch → 301 to canonical slug (not 404).
