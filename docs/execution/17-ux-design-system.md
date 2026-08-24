# Phase 17 — Design system

Tokens live in `apps/web/src/styles/global.css` (`:root`) and `apps/web/tailwind.config.js`.

| Token | Value |
|---|---|
| Background | `#f6f1e7` |
| Surface | `#ffffff` |
| Text | `#1b1814` |
| Muted | `#5c534a` |
| Accent | `#9a3412` |
| Info | `#1d4e52` |
| Font | IBM Plex Sans Arabic |
| Body | 17px / 1.8 |

Shared classes: `.btn-primary`, `.btn-light`, `.card`, `.lede`, `.prose-alshafra`, `.page-grid`.

Islands stay client-only for tools. Pages stay static HTML.

404/410 send people to الرئيسية، الأدوات، التقويم، البحث.
