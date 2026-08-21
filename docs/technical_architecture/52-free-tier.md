# 52 — Free Tier Constraints

Numbers change. Treat as **planning bounds**, verify at implementation.

## Supabase Free ([1](https://makerkit.dev/blog/saas/supabase-pricing), [2](https://uibakery.io/blog/supabase-pricing))

| Resource | Reported 2026 free | Risk |
|---|---|---|
| DB | ~500 MB | events/jobs bloat |
| Auth MAU | ~50k | ok while registration off |
| Egress | ~5 GB | HTML should be on CF not SB |
| Storage | 0.5–1 GB | **we use R2 instead** |
| Projects | 2 | preview strategy |
| Pause | ~1 week inactivity | **prod must have traffic or cron** |
| Backups | none PITR | dump to R2 ourselves |

**NEEDS VERIFICATION** on supabase.com/pricing at kickoff.

## Cloudflare ([3](https://eastondev.com/blog/en/posts/dev/20260526-cloudflare-free-limits/))

| Product | Reported free | Implication |
|---|---|---|
| Pages | static bandwidth generous; **~500 builds/mo** | debounce; don’t build 3×/day if using Actions+Pages both |
| Workers | ~100k req/day, **~10ms CPU** | jobs must be chunked; image CPU in queued small batches |
| R2 | ~10 GB storage, Class A/B limits | media caps; no video |
| R2 egress | $0 typically | good |

**NEEDS VERIFICATION** on developers.cloudflare.com.

## Architecture fit

- Public HTML on Pages CDN → avoid Supabase egress.  
- Cron keeps project “active” vs pause.  
- Purge analytics 90d.  
- One image pipeline job, not per-request resize.  
- Social/community off reduces Worker hits.
