# 51 — Infrastructure

## Target

- DNS: Cloudflare (cutover later)  
- TLS: Cloudflare universal  
- CDN: default  
- Pages: production branch build `apps/web`  
- Functions: `/api/v1/*`  
- Worker cron: jobs  
- R2: media  
- Supabase: Postgres + Auth  

## No Vercel

Do not add `@vercel/*`. Existing `vercel.json` remains **legacy debt** until DNS moves; Phase 1 does not delete it (avoid breaking current prod). Phase 2 cutover adds Cloudflare `_redirects` and stops deploying to Vercel.

## Build

`astro build` emits static + function stubs. Calendar package compiled first.

## Preview

Pages preview deployments: noindex, env preview Supabase project **or** branch-unaware read-only — **NEEDS VERIFICATION** of two-project free limit (Supabase 2 projects). Prefer one project + `preview` flags rather than two DBs if quota tight.
