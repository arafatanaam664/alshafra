# 05 — Content workflow

`idea → draft → review → scheduled → published → unpublished/archived`

Author: `draft → review` only. Publish requires `documents.publish`.

Each transition writes `audit_logs`. Publish inserts a revision, upserts `routes`, sets robots `index_follow`.
