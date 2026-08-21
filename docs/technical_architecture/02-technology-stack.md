# 02 — Technology Stack

## Final stack

| Layer | Choice | Why |
|---|---|---|
| Public UI | **Astro** (HTML-first) | H3; SEO; less JS |
| Interactive UI | **React 18 islands** + TypeScript | Reuse tool UIs from legacy |
| Admin UI | React + TypeScript | Dense forms |
| CSS | Tailwind 3 + RTL | Existing design language |
| Domain | TypeScript packages | Portable engines |
| Validation | **Zod** | Shared FE/BE/DB boundary |
| Database | **Supabase PostgreSQL** | ADR-006 |
| Auth | **Supabase Auth** behind `AuthProvider` | ADR-008 |
| Blobs | **Cloudflare R2** | ADR-007 |
| Host | **Cloudflare Pages** | H4 |
| Edge | Cloudflare CDN + optional Turnstile | WAF/captcha |
| Jobs | Postgres `jobs` + Cron Worker | ADR-015 |
| Search | Postgres FTS + `SearchProvider` | ADR-012 |
| Icons | lucide-react (islands/admin only) | already in repo |

## Explicitly rejected for this phase

| Not | Why |
|---|---|
| Next.js / OpenNext | H3 |
| New Vercel project | H4 |
| GraphQL | No fan-out need; REST + SSG |
| Redis | $0; Postgres jobs suffice |
| Kafka / SQS | Overkill |
| Prisma required | Optional later; start with SQL migrations + typed client (`postgres.js` or Supabase) — **decision: SQL migrations + `zod` row schemas**. ORM is not mandatory. |
| WordPress / Sanity | ADR-010 |
| Meilisearch now | Later swap |

## Dependencies that will be needed (purpose / alternative / reason)

| Package | Purpose | Alternative | Reason to add |
|---|---|---|---|
| `astro` | Public renderer | Next | H3 |
| `@astrojs/react` | Islands | Preact | Team knows React |
| `react` / `react-dom` | Islands + admin | — | Tools |
| `typescript` | Types | — | |
| `tailwindcss` | CSS | — | Existing |
| `zod` | Validation | Valibot | Ecosystem |
| `@supabase/supabase-js` | Adapter only | `postgres` driver | Auth + RLS |
| `lucide-react` | Icons | — | Already present |

Do **not** add axios, redux, react-router on the public site (Astro file routing). Admin may use a small client router.

## Conflict with current `package.json`

Today: Vite app named `vite-react-typescript-starter`. Phase 2+ replaces the public app with Astro. Legacy `src/lib/hijri.ts` is **ported into** `packages/calendar`, not thrown away.
