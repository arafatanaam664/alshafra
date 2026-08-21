# 59 — Domain Event Catalog

Payloads JSON, `event_id` UUIDv7, `occurred_at` UTC. Transport: in-process → jobs table. Retry = job retry. Idempotency = `event_id` or business key.

| Event | Producer | Consumers | Payload (min) | Idempotency |
|---|---|---|---|---|
| `user.created` | Users | Analytics, Audit | user_id | user_id |
| `article.created` | Content | Audit | document_id | document_id+created |
| `article.updated` | Content | Search | document_id, version | revision_id |
| `article.published` | Content | Search, SEO sitemap, IndexNow, Automation | document_id, path, category_key | document_id+version |
| `article.unpublished` | Content | Search remove, sitemap, purge | path | document_id+unpublished_at |
| `comment.created` | Community | Notify, Moderation | id | id |
| `question.created` | Community | Notify, Quality (no index) | id | id |
| `answer.created` | Community | Notify | id, question_id | id |
| `media.uploaded` | Media | Variants job | media_id | media_id |
| `social.publish.requested` | Automation | Social worker | job_id | idempotency_key |
| `social.publish.completed` | Social | Audit | external_id | job_id |
| `social.publish.failed` | Social | Notify admin | error | job_id+attempt |
| `job.failed` | Jobs | Notify admin | job_id | job_id+attempt |
| `content.published` | alias of article.published for all document types | same | type | |

Do not include body HTML in events (size). Include path, title, excerpt.
