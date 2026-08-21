# 34 — Job System

Worker cron every 1 min (Cloudflare Cron). Claim:

```sql
UPDATE jobs SET status='running', locked_at=now(), locked_by=$worker
WHERE id = (
  SELECT id FROM jobs WHERE status='queued' AND run_at<=now()
  ORDER BY priority DESC, run_at FOR UPDATE SKIP LOCKED LIMIT 1
) RETURNING *;
```

Backoff: `run_at = now() + interval '1 min' * 4^(attempts-1)` capped 6h.

Idempotency unique. Dead after max_attempts. Admin retry resets to queued.

**Jobs contain orchestration, not Hijri math.** They call Calendar/Tools/SEO services.

Types: `prices.fetch`, `content.revalidate`, `sitemap.rebuild`, `indexnow.submit`, `search.index`, `media.process`, `media.gc`, `social.publish`, `notify.dispatch`, `analytics.rollups`.
