# 06 — Dependency Rules

Direction:

```
apps → domain/ports packages → kernel/config
ui ↛ database, social, content
seo ↛ database
content ↛ ui, social
calendar ↛ react, astro, supabase
```

Compile-time: TypeScript paths + `tools/check-boundaries.mjs`.  
No HTTP between packages. No queues between packages. Shared Postgres later, one DB.
