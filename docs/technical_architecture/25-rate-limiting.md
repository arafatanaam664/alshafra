# 25 — Rate Limiting

## Port

```ts
interface RateLimiter {
  hit(key: string, limit: number, windowSec: number): Promise<{ ok: boolean; remaining: number }>;
}
```

Adapters: in-memory (dev), Cloudflare rate-limit / KV (prod). Not tied to one vendor.

## Initial limits (per IP unless noted)

| Action | Limit |
|---|---|
| Login / magic link | 5 / 15 min / email+IP |
| Signup (when on) | 3 / h / IP |
| Search GET | 60 / min / IP |
| Analytics beacon | 120 / min / IP |
| Comments/questions/answers | 10 / h new user; 30 / h trusted |
| Votes | 60 / min / user |
| Uploads | 20 / h editor; 5 / h user |
| Admin API | 120 / min / user |
| Social publish | 10 / 10 min / account (also provider rules) |

429 + `Retry-After`. Turnstile on signup/login after 3 fails.
