# 07 — Cloudflare Compatibility

- `output: 'static'`  
- `build.format: 'directory'` → `path/index.html`  
- No `@astrojs/cloudflare` adapter required for this mode  
- `_redirects` in `public/` for 410/301  
- Build: `npm run build` → `apps/web/dist`  
- **Cutover not performed.** Hosting still publishes `apps/web-legacy/dist`
