# 60 — Module Dependency Graph

Allowed imports (→ depends on):

```
kernel ← (everyone)

Identity → kernel
Users → Identity, kernel
Audit → Users, kernel
Flags → kernel
Media → Users, kernel
Categories → kernel
Tags → kernel
SEO → kernel   (pure compute; not Content repo)
Calendar → kernel
Tools → Calendar, kernel
Content → Users, Media, Categories, Tags, SEO(compute), Flags, Audit, kernel
Search → kernel (DTO from jobs)
Community → Users, Categories, Flags, kernel
Moderation → Users, Community, Audit
Notifications → Users
Social → Jobs (enqueue), Audit, Flags
Automation → Jobs, Flags
Jobs → (calls application services at runtime; compile-time Jobs must not import Social adapters)
Monetization → Flags
Analytics → kernel
Admin → (composition root — may import all application layers)
```

## Forbidden

- Content → Social  
- SEO → Content repositories (cycle)  
- Calendar → React/Astro  
- UI → supabase-js  
- Social adapters → Content writes  

Runtime worker may import Content **application** to load DTO for social. That is the composition root (`apps/worker`), not a module cycle.
