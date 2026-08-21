# 41 — Frontend Architecture

## Apps

```
apps/web/                 # Astro public
  src/pages/              # file routes = public URLs
  src/layouts/
  src/components/         # Astro (zero JS)
  src/islands/            # React
  src/styles/
apps/admin/               # React admin (Vite or Astro hybrid)
packages/calendar
packages/tools
packages/ui               # design system
packages/domain
packages/kernel
```

## Separation

- Islands may import `packages/calendar` and `packages/ui`.  
- Islands must **not** import Supabase or service role.  
- Astro pages call server loaders (`src/lib/server/*`) that use repositories.  
- No React context wrapping the whole public site.

## Routing

Astro file-based. Dynamic params validated against `routes` table. TrailingSlash: `never`. Site: `https://alshafra.com`.

## Brand (H1)

Layout site name **Alshafra**. Calendar nav group label **التقويم والمواعيد**. Schema alternateName includes تقويم السعودية.

## Title (H2)

`<title>{seoTitle}</title>` as stored; no layout suffix injection.
