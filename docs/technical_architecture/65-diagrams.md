# 65 — Diagrams

## 1. System Architecture

```mermaid
flowchart TB
  B[Browser] --> CF[Cloudflare CDN/WAF]
  CF --> P[Pages HTML]
  CF --> F[Functions /api/v1]
  CF --> W[Cron Worker]
  P --> Cal[packages/calendar]
  F --> Dom[Domain services]
  W --> Dom
  Dom --> SB[(Supabase PG + Auth)]
  Dom --> R2[(R2)]
```

## 2. Module Boundaries

```mermaid
flowchart LR
  Admin --> Content
  Admin --> SEO
  Content --> Media
  Content --> Users
  Tools --> Calendar
  Social --> Jobs
  Automation --> Jobs
  Community --> Users
```

## 3. Database ERD (core)

```mermaid
erDiagram
  users ||--o{ user_roles : has
  roles ||--o{ user_roles : has
  roles ||--o{ role_permissions : has
  permissions ||--o{ role_permissions : has
  users ||--o| profiles : has
  authors ||--o{ documents : writes
  categories ||--o{ documents : classifies
  documents ||--|{ document_revisions : versions
  documents ||--o| document_seo : seo
  documents }o--o{ tags : document_tags
  documents }o--o{ topics : document_topics
  documents ||--o{ faq_items : faqs
  documents ||--o{ sources : cites
  documents ||--o{ document_relations : related
  media ||--|{ media_variants : variants
  documents }o--o| media : featured
  tools ||--o| documents : tool_page
  routes }o--o| documents : resolves
  routes }o--o| tools : resolves
  redirects ||--|| redirects : none
  questions ||--|{ answers : has
  questions }o--o{ votes : votes
  social_accounts ||--o{ social_publish_jobs : publishes
  jobs ||--|{ job_attempts : attempts
  users ||--o{ audit_logs : actor
```

Cardinality notes: documents.path UNIQUE; routes.path UNIQUE; social_publish_jobs.idempotency_key UNIQUE; users.auth_user_id UNIQUE.

Indexes: see 06 (path, FTS GIN, jobs status/run_at).

## 4. Request Flow

```mermaid
sequenceDiagram
  participant B as Browser
  participant CF as Cloudflare
  participant R as Resolver
  participant A as Astro
  B->>CF: GET /date-converter
  CF->>R: normalize
  R-->>A: routes hit 200 tool
  A-->>B: HTML + island JS
```

## 5. Authentication

```mermaid
sequenceDiagram
  participant U as User
  participant API
  participant SA as Supabase Auth
  participant D as users table
  U->>API: Google/email
  API->>SA: verify
  SA-->>API: auth.uid
  API->>D: upsert domain user
  API-->>U: session cookie
```

## 6. Authorization

```mermaid
flowchart TB
  Req --> Session
  Session --> RBAC{has_permission}
  RBAC -->|no| 403
  RBAC -->|yes| BFF
  BFF --> RLS
```

## 7. Content Publishing

```mermaid
sequenceDiagram
  participant E as Editor
  participant API
  participant DB
  participant Q as jobs
  E->>API: POST publish + Idempotency-Key
  API->>DB: revision + status
  API->>Q: revalidate sitemap search
  API-->>E: 200 published
```

## 8. Legacy URL Resolution

```mermaid
flowchart TB
  Path --> Norm[strip slash]
  Norm --> Redir{redirects}
  Redir -->|410 prefix| Gone
  Redir -->|301| Redirect
  Redir -->|miss| Routes{routes.path}
  Routes -->|hit| Handler
  Routes -->|miss| AstroFile
  AstroFile -->|miss| N404
```

## 9. SEO Rendering

```mermaid
flowchart LR
  Doc --> Inherit[site → doc seo]
  Inherit --> Title[H2 no auto suffix]
  Inherit --> Can[self canonical]
  Inherit --> Robots
  Inherit --> JSONLD
```

## 10. Search

```mermaid
flowchart TB
  Q[query] --> N[normalize Arabic]
  N --> Syn[synonyms]
  Syn --> FTS[(tsvector)]
  FTS --> Rank
```

## 11. Media

```mermaid
flowchart LR
  Up --> Val --> Job[media.process] --> R2
  Job --> DB[(media_variants)]
```

## 12. Community

```mermaid
flowchart TB
  Ask --> Q[question noindex]
  Q --> Ans
  Ans --> Gate{auto_index flag}
  Gate -->|false v1| Stay
```

## 13. Social Publishing

```mermaid
sequenceDiagram
  participant C as content.published
  participant A as Automation
  participant J as social job
  participant P as Provider
  C->>A: event
  A->>J: enqueue per provider
  J->>P: publish
  Note over C: document stays published
```

## 14. Automation

```mermaid
flowchart LR
  Event --> Match[rules] --> Cond{and/or} --> Enq[enqueue job]
```

## 15. Job Queue

```mermaid
flowchart TB
  Cron --> Claim[SKIP LOCKED]
  Claim --> Run
  Run --> OK
  Run --> Retry[backoff]
  Retry --> Dead
```

## 16. Feature Flags

```mermaid
flowchart TB
  Admin --> Row[(feature_flags)]
  Row --> Snap[edge snapshot]
  Snap --> Nav
  Snap --> API
```

## 17. Analytics

```mermaid
flowchart LR
  Page --> Beacon[/public/events]
  Beacon --> EV[(analytics_events)]
  Page --> GA[GA4 optional]
```

## 18. Deployment

```mermaid
flowchart TB
  Git --> PagesBuild
  PagesBuild --> CDN
  WorkerCron --> PG
  DNS --> CF
```
