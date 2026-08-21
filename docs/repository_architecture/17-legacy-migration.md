# 17 — Legacy File Migration

| Current (old) | Target | Action | Dependencies | Risk | Validation |
|---|---|---|---|---|---|
| `src/` | `apps/web/src/` | git mv | Vite | Medium | typecheck, build |
| `public/` | `apps/web/public/` | git mv | prerender | Medium | 127 pages |
| `index.html` | `apps/web/index.html` | git mv | Vite | Low | build |
| `vite.config.ts` + tailwind/postcss/eslint/tsconfig.app|node | `apps/web/` | git mv | — | Low | lint |
| `scripts/*.mjs` | `apps/web/scripts/` | git mv | GH workflow | Medium | workflow paths updated |
| `src/lib/hijri.ts` | `packages/calendar/src/hijri.ts` + re-export | copy + thin | events, countdowns | Medium | typecheck; same exports |
| `applyWeekendRule` | `packages/calendar/src/weekend.ts` | move | events.ts re-export | Low | typecheck |
| `package.json` (app) | root orchestrator + `apps/web/package.json` | split | npm workspaces | Medium | npm install |
| `.github/workflows/daily-publish.yml` | same file, new paths | edit | — | Medium | path exists |
| `netlify.toml` publish | `apps/web/dist` | edit | — | Low | — |
| `vercel.json` | `outputDirectory` | edit | — | Low | — |
| JSON content | stays in `apps/web/src/data` | **no DB** | — | — | — |
| Vite prerender | stays | **not deleted** | 127 URLs | High if removed | build still 127 |

**Not moved:** `docs/`, `PROJECT.md`, hosting 410 rules (still in netlify/_redirects under public).
