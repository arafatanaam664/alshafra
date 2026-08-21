# 03 — Module Boundaries

Modular monolith. Import **down** the dependency graph (`60-dependency-graph.md`). No circular imports.

Convention: `packages/<module>/{domain,application,adapters}`.

Shared kernel (`packages/kernel`): IDs, clock, Result type, events bus interface — no feature logic.

---

## Module catalog

| # | Module | Owns | Must not own |
|---|---|---|---|
| 1 | Identity | AuthProvider, sessions mapping | Profiles UX |
| 2 | Users | `users`, profiles, handles | Auth tokens |
| 3 | Content | `documents`, revisions, relations, FAQ, sources | UGC tables, R2 bytes |
| 4 | Categories | categories, topics | documents body |
| 5 | Tags | tags, document_tags | SEO canonical |
| 6 | Media | metadata, variants, BlobStore port | HTML rewrite |
| 7 | Tools | tool registry, engines keys, snapshots config | Page Astro files |
| 8 | Calendar | Hijri, TZ, salary rule, events, countdowns schedule | React components |
| 9 | Search | SearchProvider, FTS index job, synonyms | Document write |
| 10 | SEO | canonical compute, robots, sitemap, redirects, 410, quality gate **policy** | Body editing |
| 11 | Community | questions, answers, comments, votes, follows | Editorial publish |
| 12 | Moderation | reports, actions, bans | CMS workflow |
| 13 | Notifications | notification rows, dispatch job | Email vendor lock in domain |
| 14 | Social | accounts, templates, adapters, publish jobs | Document status |
| 15 | Automation | rules, runs | Direct HTTP to Facebook |
| 16 | Jobs | `jobs`, attempts, worker | Full business rules (calls modules) |
| 17 | Analytics | event ingest, rollups | GA snippets in domain |
| 18 | Monetization | ad_slots, placements | AdSense JS in domain |
| 19 | Feature Flags | flags, evaluation | Hard-coded ifs in random UI |
| 20 | Admin | composition of above, admin routes | New domain tables |
| 21 | Audit | append-only logs | Deletes |

Calendar may be imported by Tools and Content. Content must not import Social. Social consumes events.

---

## Per-module template (summary)

Each module implements:

- **Entities** (tables in 05)
- **Services** (application use-cases)
- **Inputs/Outputs** (commands/queries, Zod)
- **Dependencies** (other modules, ports)
- **Events** produced/consumed (59)
- **Permissions** (20, 07)

### Content (example of the pattern)

- **Responsibilities:** editorial lifecycle, body blocks, import from JSON  
- **Entities:** documents, document_revisions, faq_items, sources, document_relations  
- **Services:** createDraft, submitReview, publish, unpublish, restoreRevision  
- **Inputs:** editor commands  
- **Outputs:** document DTO, `content.published`  
- **Deps:** Users (author), Media, Categories, Tags, SEO (compute), Flags, Audit, Jobs (enqueue)  
- **Must not call:** Social adapters  
- **Permissions:** `documents.read_draft`, `documents.publish`, …

### Calendar

- **Responsibilities:** Umm Al-Qura, Riyadh today, weekend payday, countdown resolution  
- **Pure functions** + config tables  
- **Deps:** none of UI; optional Content for tool_page copy  
- **Events:** none required on convert; `prices.snapshot.updated` is Tools

### SEO

- **Responsibilities:** indexable boolean, sitemap files, redirect/410 registry, title policy (H2)  
- **Deps:** Content/Tools/Community **read** ports — not the other way into Content writes  
- **To avoid cycles:** Content calls `seo.compute(document)` (kernel-level function) rather than SEO module importing Content repositories.

### Social

- **Responsibilities:** OAuth connect, encrypted token refs, publish jobs  
- **Deps:** Jobs, Audit, Flags; reads Content DTO via event payload  
- **Must not:** roll back `documents.status`

---

## Public vs admin composition

`apps/web` may import Calendar, Content **read**, SEO **read**, Tools engines.  
`apps/admin` may import Content write, SEO write, Flags, Social, Moderation.  
`apps/worker` may import Jobs, Tools prices, Social, Search index, SEO sitemap.
