# 66 — Self Review

## Contradictions resolved

| Issue | Resolution |
|---|---|
| Phase 0 ADR-004 Next vs Astro | H3 locks Astro (ADR-101) |
| Phase 0 brand تقويم السعودية vs H1 | H1 Alshafra; alternateName kept |
| Prompt listed `articles` table vs Phase 0 supertype | `documents` + type enum |
| Prompt GraphQL optional | REST only |
| 1500-word pad vs quality | unique_text_word_count ~800 unique |
| RLS bypass service role vs “RLS protects all” | Dual: RLS + BFF RBAC |
| Jobs vs GitHub Action 3×/day | Cron primary; Action optional until cutover |
| `/category` new IA vs 410 | `/topics/:slug` only |
| Admin on Pages vs 10ms CPU | Admin mutations cheap; media async |
| SearchAction in legacy | Remove until `/search` |

## Orphan tables

None intended: every table has an owner module.

## Circular deps

SEO compute is kernel-pure; Content does not import SEO repositories.

## Missing indexes

Covered: path, FTS, jobs, idempotency, auth_user_id.

## Unsafe RLS

Anon SELECT drafts forbidden. Tokens not in views.

## Missing permissions

Mapped to Phase 0 matrix + keys in 20.

## Missing APIs

Publish, list, media, flags, health, prices, events beacon. Community/social stubbed.

## Legacy routes

127 in 62. name-decoration extra. Locales 404.

## Unnecessary complexity

No Kafka, no GraphQL, no Prisma mandate, no 16 langs.

## Phase 0 vs code

Code = Vite/Vercel; Phase 1 = Astro/Cloudflare. Documented, not ignored. Engines in code remain source for calendar port.
