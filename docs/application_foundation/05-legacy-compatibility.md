# 05 — Legacy Compatibility

- 127 paths from published.json → Astro static files  
- Trailing slash: never  
- Canonical: `https://alshafra.com{path}`  
- 410: `public/_redirects` `/category/*` `/languages/*` `/news/*` → `/410.html`  
- 404: `src/pages/404.astro`  
- No `/* /index.html 200`  
- Vite remains `npm run build:legacy` / `npm run dev:legacy`  
- Production GH Action still `build:legacy` (do not cut hosting)
