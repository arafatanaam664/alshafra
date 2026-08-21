# 01 — Astro Architecture

```
apps/web/
  astro.config.mjs     output: static, trailingSlash: never, site alshafra.com
  src/pages/index.astro
  src/pages/[...slug].astro   126 legacy paths
  src/pages/404.astro
  src/pages/sitemap.xml.ts
  src/layouts/SiteLayout.astro
  src/components/Header.astro Footer.astro
  src/islands/* React
  src/content/provider.ts     LegacyContentProvider
  public/                     robots, _redirects 410, ads.txt, og
```

Adapter: **none** (static HTML). Cloudflare Pages compatible as a static site.

Domain packages remain framework-agnostic (`@alshafra/calendar` has no Astro/React imports).
