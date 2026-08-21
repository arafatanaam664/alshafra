# 02 — Execution plan (chat order, not a parallel roadmap)

Source of truth: the reference chat’s 40-stage map + implementation Phases 0–5 already in this repo.  
Do not invent a second numbering system that puts Vite back in front of Astro.

## Done

| Chat / impl | What |
|---|---|
| مرحلة 0–5 + impl 0–5 | Spec, stack (Astro), repo, schema, flags, CMS |
| M0 stabilize | Phases 0–5 committed on this branch |
| **Phase 6** | Public integration: CMS → snapshot → **Astro SSG** |
| **Phase 7 (this cycle)** | SEO engine on Astro: JSON-LD graph, breadcrumbs, sitemap index |

## Next (do not start until the owner says ابدأ)

Follow the chat:

8. Internal linking engine  
9. Public search (`/search` noindex, Postgres FTS)  
10. Tool engine expansions  
11. Media / R2 (blocked on owner creating the bucket)  
12. Community only after flags + Turnstile + moderation  

Hosted Supabase, R2, and Cloudflare DNS wait for the owner. Never paste secrets in chat.

## Hard stops from the chat

No community/social/AI/16 languages/Meilisearch/microservices.  
No deleting Vite. No changing the 127 URLs. No thin indexed hubs.
