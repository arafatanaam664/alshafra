# 42 — Astro Islands Strategy

## Per page type

| Page | Render | JS |
|---|---|---|
| Article / guide / legal / collection | **SSG** (or ISR on-demand) | none unless share island `client:visible` |
| `/date-converter`, `/age-calculator`, name-decoration | SSG shell + **React island** `client:load` | tool only |
| `/today`, `/salaries`, countdown | SSG with **build-time dates** + island for tick `client:visible` | small |
| `/hijri-calendar` | SSG month table + island for month switch | |
| Gold/USD | SSG from snapshot + optional island none | none required |
| `/search` | **SSR** | none or tiny |
| `/admin` | SPA / heavy islands `client:load` | full React |
| Preview | SSR noindex | |

## Rules

- `client:load` only for tools that cannot work without JS.  
- Countdown numbers exist in HTML (days remaining at build) so crawlers see data.  
- Share buttons: `client:visible`.  
- No `client:load` on article body.

## Hydration cost budget

Article JS ≤ **30 KB gz** extra (share + maybe ads). Tool pages ≤ **80 KB gz** island + calendar pkg.
