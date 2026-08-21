# 23 — Social Publishing

**Flag:** `social_auto_publish_enabled` default false.

This is **outbound publishing from CMS**, not on-page share buttons.

## Provider adapter

```
SocialProvider {
  connect(oauth)
  disconnect()
  refreshToken()
  publish(job): ProviderResult  // { external_id, permalink }
  health()
}
```

Implementations: `FacebookProvider`, `TelegramProvider`, `XProvider`.  
Stubs: `InstagramProvider`, `LinkedInProvider`, `YouTubeProvider`.

Each provider is independent. No shared payload shape beyond a canonical `SocialPost`:

```
{ provider, template_id, title, summary, body, cta, link, media[], hashtags[], idempotency_key }
```

## Account management

- Connect / disconnect OAuth (or bot token for Telegram).
- **Never store account passwords.**
- Tokens in encrypted secrets store (Supabase vault or env + worker secrets). Refresh via jobs.
- Logs, retry, schedule, failure states per job — not per article.

## Templates (editable in admin)

| Provider | Fields |
|---|---|
| Facebook | title, summary, CTA, image, link |
| X | short copy, link, hashtags |
| Telegram | title, summary, link, image |
| Instagram | caption, hashtags, media (future) |

Templates support `{{title}} {{url}} {{summary}}`.

## Failure isolation

If Facebook fails and Telegram succeeds:

- Content remains **Published**
- Facebook job = `failed` / `retrying`
- Telegram job = `succeeded` with `external_id`

See idempotency in `25-job-queue-architecture.md`.

## Human control

Automation may enqueue. Social Manager can require manual approve per rule.
