# 29 — Notifications

Table `notifications`. Channel in_app only (v1). Email later `email_enabled`.

Types: `answer.created`, `mention`, `moderation`, `job.failed` (admins), `social.failed`.

Fan-out via `notify.dispatch` job. Never in the publish HTTP request.

Mark read: `PATCH /me/notifications/:id` `{ read: true }`.
