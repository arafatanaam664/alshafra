# Phase 6 — Public website integration (Astro SSG)

**Status:** implemented on this branch (2026-08-21)  
**Source:** chat plan — «CMS → Database → Content Snapshot → Astro SSG → CDN»

This is **not** a Vite milestone. The public renderer is **Astro**, as locked in Phase 1 (H3 / ADR-101). Vite remains `apps/web-legacy` for rollback only. Do not delete it.

Host today is still **Vercel**. Cloudflare Pages is the later host cutover the owner already scheduled. Host ≠ renderer.

## Pipeline

```
Admin publish
  → Postgres (PGlite locally)
  → content snapshot JSON
  → Astro static build
  → apps/web/dist
```

- Default content source: `ALSHAFRA_CONTENT_SOURCE=composite`
- Composite = 127 JSON pages **plus** new published CMS routes
- The 127 legacy identities are **not** rewritten from the snapshot
- New CMS URLs enter the sitemap only after the quality gate
- JSON fallback stays (chat: do not remove it if that would break the site)

## Out of scope (chat: do not start)

Community, social OAuth/publishing, automation, email, AI, jobs, scholarships, 16 languages, Meilisearch, DNS change, deleting Vite.
