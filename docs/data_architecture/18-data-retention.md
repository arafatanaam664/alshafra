# 18 — Data Retention & Soft Delete

| Kind | Strategy |
|---|---|
| documents, media metadata, questions/answers/comments, users | `deleted_at` |
| document_revisions | immutable; never delete |
| audit_logs, analytics_events | no user delete; analytics purge >90d later |
| votes/bookmarks/follows | hard delete (toggle) |
| feature_flags / roles | deactivate, do not delete |
| price_snapshots | append-only |

YMYL: unpublish preferred over delete.
