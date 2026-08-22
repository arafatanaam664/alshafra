# 02 — Execution plan (chat order, not a parallel roadmap)

Source of truth: the reference chat’s 40-stage map + implementation Phases 0–5 already in this repo.  
Do not invent a second numbering system that puts Vite back in front of Astro.

## Done

| Chat / impl | What |
|---|---|
| مرحلة 0–5 + impl 0–5 | Spec, stack (Astro), repo, schema, flags, CMS |
| M0 stabilize | Phases 0–5 committed on this branch |
| **Phase 6** | Public integration: CMS → snapshot → **Astro SSG** |
| **Phase 7** | SEO engine on Astro |
| **Phase 8** | Internal linking engine |
| **Phase 9** | Public search `/search` noindex + FTS pipeline |
| **Phase 10** | Tools engine + `/tool/:slug` calculators |
| **Phase 11** | Media engine + R2 adapter (keys later) |
| **Phase 12 (this cycle)** | Community engine + Turnstile + moderation (flags off) |

## Next (do not start until the owner says ابدأ)

Follow the chat after community: notifications / social publishing remain flagged off. Do not enable registration or UGC index.

Owner still places R2 / Turnstile / Supabase keys locally or on Vercel before launch. Never paste secrets in chat. 

Hosted Supabase, R2, and Cloudflare DNS wait for the owner. Never paste secrets in chat.

## Hard stops from the chat

No community/social/AI/16 languages/Meilisearch/microservices.  
No deleting Vite. No changing the 127 URLs. No thin indexed hubs.
