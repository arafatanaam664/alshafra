# 32 — Social Publishing Jobs

`social_publish_jobs.idempotency_key` = `social:{provider}:{document_id}:{template_version}`.

Retry: exponential 1m, 5m, 25m, 2h. Max 8. Then `failed` (not `dead` unless worker crash loop).

Partial: Telegram success + Facebook fail → article published, Facebook job failed, Telegram not retried.

Templates: `{{title}} {{url}} {{summary}}` from document DTO in event payload (frozen at enqueue so later edits don’t change in-flight posts unless new job).
