# 10 — Performance Comparison

Measured on production builds in this phase:

| | Vite SPA (legacy) | Astro (new) |
|---|---|---|
| Main JS | `index-*.js` ~451 KB (134 KB gz) + many route chunks | React island runtime ~137 KB (44 KB gz) **only on pages with islands** |
| Date converter extra | full page chunk ~8 KB + hijri | island 2.5 KB + hijri 3.5 KB |
| Article JS | hydrates app shell | Share island 0.64 KB |
| HTML | prerendered 127 | SSG 127 + 404 |

Articles are HTML-first. No global React on article pages except optional share island.
