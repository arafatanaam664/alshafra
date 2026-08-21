# 01 — Repository Structure

```
alshafra/
├── apps/
│   ├── web/                 # PUBLIC site (Vite + React + prerender) — production
│   │   ├── src/             # former root src/
│   │   ├── public/
│   │   ├── scripts/         # prerender, prices, IndexNow
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json     # @alshafra/web
│   └── admin/               # staff shell only (no CMS)
│
├── packages/
│   ├── calendar/            # Hijri + weekend rule (real code)
│   ├── kernel/              # Result, ids
│   ├── config/              # env names
│   ├── ui/                  # tokens
│   ├── auth/                # AuthProvider port
│   ├── content/             # document types
│   ├── seo/                 # canonical/title/robots
│   ├── search/              # SearchProvider port
│   ├── media/               # StorageProvider + keys
│   ├── social/              # SocialProvider port
│   ├── notifications/       # types
│   ├── analytics/           # event allowlist
│   ├── database/            # client-kind convention
│   └── tools/               # user-facing tool registry (not CLI)
│
├── tools/                   # developer CLI (boundary checker)
├── tests/legacy/            # 127 URL inventory check
├── docs/
│   ├── product_architecture/
│   ├── technical_architecture/
│   └── repository_architecture/
├── package.json             # workspace orchestrator
├── tsconfig.base.json
├── tsconfig.json
├── .env.example
├── netlify.toml             # publish apps/web/dist
├── vercel.json              # outputDirectory apps/web/dist
└── .github/workflows/daily-publish.yml
```

**Not created:** `packages/types`, `packages/utils`, `apps/mobile`, Turborepo, Astro app, `packages/community` (postponed — contracts not needed until Phase 4+).
