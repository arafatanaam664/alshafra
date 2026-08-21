# 19 — Internal Linking Engine

Replace the prerender token-overlap hack with a **deterministic engine** using the content model.

## Link types

| Type | Source |
|---|---|
| Structural | Nav, footer, hubs, breadcrumbs |
| Manual related | CMS `RelatedContent` |
| Automatic related | same Topic, same Category, shared Tool, cosine/token overlap |
| Contextual | editors insert in body |
| Cluster | Topic pillar → members |

## Rules

1. Every public indexable URL has inbound from at least one hub.
2. Calendar cluster: bidirectional between tool and matching article (converter ↔ conversion article, salaries ↔ salary article).
3. Gold country ↔ USD same country.
4. Countdown ↔ event/holiday/salary tool.
5. Do not auto-link across locales.
6. Do not auto-link to noindex/UGC pending.
7. Max auto related: 6, prefer diversity of types (1 tool + 1 article + …).
8. Manual related always win and appear first.

## Breadcrumbs

`الرئيسية › {Section} › {optional Category} › {Title}`  
Legacy calendar pages: `الرئيسية › المواعيد والتقويم › …`  
JSON-LD BreadcrumbList matches visible crumbs.

## Orphan job

Nightly: list indexable URLs with 0 internal inlinks (excluding home). Admin alert. Same idea as current prerender warning, but data-driven.
