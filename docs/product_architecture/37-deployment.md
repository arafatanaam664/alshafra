# 37 — Deployment Strategy

## Target (product requirement)

**Cloudflare Pages + Supabase + Cloudflare R2**  
Current budget: **$0**. Design for free tier, allow paid later.

## Current (legacy)

Vite static `dist/` on **Vercel and/or Netlify**, GitHub Actions 3×/day fetching prices and committing JSON to `main`.

Phase 1 must **not** assume two hosts. One production origin: `alshafra.com`.

## Proposed topology

```
Editors → Admin (Pages/Workers, SSR limited)
Public  → Cloudflare Pages static / SSR islands
Data    → Supabase Postgres + Auth
Files   → R2
Cron    → Cloudflare Workers Cron (and/or GitHub Actions as backup)
DNS     → Cloudflare (when migrated)
```

## Free-tier mapping

| Need | $0 choice | Later |
|---|---|---|
| Static hosting | Pages | same |
| Postgres | Supabase free | paid |
| Auth | Supabase Auth | any via interface |
| Objects | R2 free quota | paid |
| Queue | Postgres jobs + Cron | Cloudflare Queues |
| Images | Worker resize / build-time | Cloudflare Images |
| Email | none | Resend/etc |

## Build

- Public pages: static generate at build **or** on-demand revalidate per path.
- Do not require a git commit to publish an article (that is the CMS point). GitHub Action should not be the CMS.

## Preview

Pull request / branch Pages previews: `noindex`, basic auth or Cloudflare Access if possible on free.

## DNS cutover

Out of Phase 0. When it happens: keep 301/410 rules, TLS, HSTS, www→apex or apex only (pick one; currently apex `alshafra.com`).

## Dual-config debt

`vercel.json` and `netlify.toml` both exist. Target: Cloudflare `_redirects` / Bulk Redirects / `wrangler` equivalent of 410 rules. Until cutover, **production host must implement 410**.

## Rollback

Keep previous Pages deployment. Content rollback = CMS revision restore + revalidate.
