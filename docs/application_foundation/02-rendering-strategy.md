# 02 — Rendering Strategy

| Type | Mode | JS |
|---|---|---|
| Home, articles, guides, legal, gold/usd, collections | **SSG** | Share island `client:visible` only |
| Date converter, age calculator | SSG + **island `client:load`** | tool |
| Countdown | SSG numbers + island tick `client:visible` | tiny |
| Today / salaries / hijri | SSG (dates at build) | none required |
| Search | not in Phase 3 | — |
| Admin | still Vite shell | — |

No SSR. No SPA fallback.
