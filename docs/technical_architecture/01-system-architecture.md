# 01 — System Architecture

## Target topology

```
Browser
  → Cloudflare (DNS, TLS, CDN, WAF, Turnstile)
    → Cloudflare Pages
         ├─ Static HTML/CSS/hashed assets (articles, most tools shells)
         ├─ Pages Functions / Worker  (/api/v1/*, on-demand SSR, /admin BFF)
         └─ React islands (hydrators only)
    → Domain services (TypeScript modular monolith, runs in Functions/Worker or build)
         ├─ Supabase PostgreSQL + Auth
         └─ Cloudflare R2 (blobs)
    → Cron Worker (jobs poller)
```

Not everything is an HTTP API. See access modes below.

## Access modes

| Mode | Used for | Auth | Cache |
|---|---|---|---|
| **Build-time read** | SSG articles, tool shells, sitemaps | service role at build | CDN immutable/html |
| **Server-side read** | `/today`, search, preview, personalized crumbs | none or cookie | short / private |
| **Public cached read** | published HTML, R2 media, prices snapshot JSON | none | CDN |
| **Authenticated API** | votes, profile, later UGC | user JWT | private |
| **Admin API** | CMS, flags, redirects, social | user JWT + RBAC | private, no CDN |
| **Background jobs** | prices, revalidate, IndexNow, social, search index | service role | n/a |

**Rule:** Browsers never hold the Supabase service role. Public clients never query Postgres directly except via RLS-hardened views if we ever use Supabase JS in the admin app — preferred path is **BFF**: Astro/Worker → domain service → Supabase.

## Logical layers

```
UI (Astro pages, React islands, admin React)
  → Application (use-cases / commands)
    → Domain (calendar engines, content state machine, quality gate)
      → Ports (repositories, SearchProvider, AuthProvider, SocialProvider, Queue, BlobStore)
        → Adapters (Supabase, R2, Cloudflare KV optional, IndexNow HTTP)
```

UI must not import `supabase-js` except in adapters.

## Runtime processes

| Process | Role |
|---|---|
| `apps/web` Astro on Pages | Public site |
| `apps/admin` React on Pages `/admin` (same origin or `admin.` later) | CMS |
| `apps/worker` Cron | Job runner |
| `apps/web` Functions | `/api/v1` |

One git repo, one modular monolith. Three deployables max.

## Trust boundaries

- Internet → Cloudflare
- Functions → Supabase (SSL, service role only server-side)
- Functions → R2 (scoped token)
- Social tokens: encrypted at rest, never in logs

## Diagram

See `65-diagrams.md` §1 and request flow §4.
