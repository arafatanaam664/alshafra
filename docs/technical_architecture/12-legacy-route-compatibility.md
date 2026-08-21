# 12 — Legacy Route Compatibility Layer

## Purpose

The new Astro app must answer the **same URLs** as `published.json` (127) using new handlers, without requiring 301s.

## `LegacyRouteResolver`

```ts
type Resolved =
  | { kind: 'ok'; status: 200; handler: Handler; entity: EntityRef }
  | { kind: 'redirect'; status: 301|302|307|308; location: string }
  | { kind: 'gone'; status: 410 }
  | { kind: 'not_found'; status: 404 };

resolve(pathname: string): Resolved
```

Implementation: read `routes` + `redirects` (cached at edge ~60s, purge on publish).

## Seeding

Import 127 paths from published.json:

- articles → document_id after content import  
- countdowns → countdown_definitions + tools  
- gold/usd → tools prices + country key  
- core tools → tools.path  
- legal/home → documents or static handlers  

`is_legacy = true` forever for these rows.

## Astro mapping

File routes **mirror** paths (see matrix `62`). Dynamic `[slug].astro` must 404 if slug not in `routes`.

## Tests (mandatory)

For each of 127: GET → 200, canonical, title non-empty, H1 exists, robots index (unless we later noindex `/trending/today` — H6 still open, default index).

Plus 410 samples and a random 404.

## What the Vite router did that we must not lose

- AR tools `age-calculator` / `date-converter` / `today` / `countdown` win over catalog slugs.  
- `/articles/*` is Saudi editorial, not world catalog.  
- `/trending` Arabic only.  
- No language prefix on Arabic.

Catalog unpublished locales: **404**, not GlobalPage hub.
