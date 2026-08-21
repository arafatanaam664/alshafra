# Phase 6 acceptance

- [x] Public build is Astro (`npm run build` → `apps/web/dist`)
- [x] Vercel/Netlify on this branch point at Astro
- [x] 127 JSON routes still build
- [x] Composite merge appends new published CMS routes
- [x] Legacy titles/H1/HTML are not overwritten
- [x] Thin new pages stay `noindex, follow`
- [x] Quality pages (`>= 400` unique words + description) may be `index, follow`
- [x] `database` source refuses to drop a legacy path
- [x] Vite app still builds via `npm run build:legacy`
- [ ] Live `main` still Vite until the owner merges this branch
