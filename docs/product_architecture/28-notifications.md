# 28 — Notifications

## Channels

| Channel | Wave |
|---|---|
| In-app | With community |
| Email | Future (`email_enabled`) |
| Admin alerts | P1 (job failures, 410 monitor later) |

## Types

Community (answers, mentions, accepts), moderation (new report), social job failed, system health.

## Model

```
Notification { user_id, type, payload, read_at, created_at }
```

Fan-out via queue. Never send email synchronously in request.

Respect `community_enabled`. No notifications to visitors.
