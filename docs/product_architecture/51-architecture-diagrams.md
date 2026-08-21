# 51 — Architecture Diagrams (Mermaid)

All diagrams are target-state unless labeled Legacy.

---

## 1. Legacy → New Platform Migration

```mermaid
flowchart TB
  subgraph Legacy["Legacy alshafra.com"]
    SPA[Vite React SPA]
    JSON[JSON files in git]
    PRE[prerender.mjs]
    GH[GitHub Action prices]
    HOST[Vercel / Netlify]
    SPA --> PRE --> HOST
    JSON --> PRE
    GH --> JSON
  end
  subgraph Preserve["Preserve"]
    U[127 URLs]
    H[Hijri ICU engine]
    W[Weekend salary rule]
    A[7 articles]
    C[18 countdowns]
    G[Gold/USD AR]
    G410[410 old tech]
  end
  subgraph New["New platform"]
    CMS[CMS + Postgres]
    STAT[Static/CDN HTML]
    MOD[Modular monolith]
    FL[Feature flags]
    CF[Cloudflare Pages + R2]
    SB[Supabase]
  end
  Legacy --> Preserve
  Preserve --> New
  JSON -->|one-way import| CMS
  CMS --> STAT --> CF
  MOD --> SB
```

---

## 2. System Context

```mermaid
C4Context
  title System context — Alshafra
  Person(user, "Visitor", "Arabic user")
  Person(editor, "Editor / SEO / Mod")
  System(alshafra, "Alshafra", "Content + tools + optional community")
  System_Ext(gsc, "Google / Bing")
  System_Ext(ads, "AdSense")
  System_Ext(social, "Facebook / X / Telegram")
  System_Ext(prices, "Gold & FX APIs")
  System_Ext(icu, "ICU Umm Al-Qura")
  Rel(user, alshafra, "Reads, uses tools, later posts")
  Rel(editor, alshafra, "Publishes, moderates")
  Rel(alshafra, gsc, "sitemaps, IndexNow")
  Rel(alshafra, ads, "optional ads")
  Rel(alshafra, social, "share + optional publish")
  Rel(alshafra, prices, "daily snapshot")
  Rel(alshafra, icu, "Hijri conversion")
```

If C4 render fails, equivalent:

```mermaid
flowchart LR
  User --> Alshafra
  Editor --> Alshafra
  Alshafra --> SearchEngines
  Alshafra --> R2
  Alshafra --> Supabase
  Alshafra --> PriceAPIs
  Alshafra --> SocialAPIs
```

---

## 3. High-level Architecture

```mermaid
flowchart TB
  subgraph Edge
    CDN[Cloudflare CDN]
    WAF[WAF / Turnstile]
  end
  subgraph Apps
    Pub[Public site static + islands]
    Adm[Admin CMS]
  end
  subgraph Modules
    ID[Identity]
    CO[Content]
    TO[Tools / Calendar]
    CM[Community]
    SE[Search]
    MD[Media]
    SO[SEO]
    SP[Social]
    AU[Automation]
    Q[Queue]
    MO[Moderation]
    AN[Analytics]
  end
  subgraph Data
    PG[(Postgres)]
    R2[(R2)]
  end
  CDN --> Pub
  WAF --> Adm
  Pub --> TO
  Pub --> CO
  Adm --> CO
  CO --> PG
  TO --> PG
  MD --> R2
  AU --> Q
  Q --> SP
```

---

## 4. Content Flow

```mermaid
flowchart LR
  Imp[Legacy JSON import] --> Draft
  Ed[Editor] --> Draft
  Draft --> Review --> Sched[Scheduled] --> Pub[Published]
  Pub --> HTML[Static HTML]
  Pub --> IDX[Search index]
  Pub --> SM[Sitemap]
  Pub --> EV[content.published]
  EV --> Auto[Automation]
```

---

## 5. CMS Publishing Flow

```mermaid
sequenceDiagram
  participant E as Editor
  participant CMS
  participant Q as Queue
  participant CDN
  participant S as Search
  E->>CMS: Submit publish
  CMS->>CMS: Write revision + status
  CMS->>Q: enqueue revalidate, sitemap, index, indexnow
  CMS-->>E: Published
  Q->>CDN: purge path
  Q->>S: upsert document
  Q->>Q: emit content.published
```

---

## 6. Social Publishing Flow

```mermaid
sequenceDiagram
  participant Auto as Automation
  participant Q as Queue
  participant FB as FacebookProvider
  participant TG as TelegramProvider
  participant X as XProvider
  Auto->>Q: jobs per provider + idempotency_key
  Q->>FB: publish
  alt fail
    FB-->>Q: failed → retry
  end
  Q->>TG: publish
  TG-->>Q: succeeded + external_id
  Q->>X: publish
  Note over Q: Article remains Published regardless
```

---

## 7. Automation Flow

```mermaid
flowchart TB
  E[Domain event] --> M[Match enabled rules]
  M --> C{Conditions?}
  C -->|no| Stop
  C -->|yes| A[Enqueue actions]
  A --> Q[Jobs]
```

---

## 8. Community Flow

```mermaid
flowchart TB
  U[User] --> Dup[Duplicate search]
  Dup --> Qst[Create question noindex]
  Qst --> Ans[Answers / votes]
  Ans --> Gate{Quality gate?}
  Gate -->|fail| Stay[Stay noindex]
  Gate -->|pass + policy| Idx[Index + sitemap]
  Qst --> Rep[Reports] --> Mod[Moderator]
```

---

## 9. Authentication Flow

```mermaid
sequenceDiagram
  participant V as Visitor
  participant Auth as AuthProvider
  participant SB as Supabase Auth
  participant App
  V->>Auth: email or Google
  Auth->>SB: OAuth / magic link
  SB-->>Auth: session
  Auth-->>App: user id + roles
  App->>App: RBAC check
```

---

## 10. Media Flow

```mermaid
flowchart LR
  Up[Upload] --> Val[Validate type/size]
  Val --> Opt[Transcode variants]
  Opt --> R2[R2]
  R2 --> Meta[DB metadata]
  Meta --> Page[Content references]
  Page --> CDN
```

---

## 11. Search Flow

```mermaid
flowchart TB
  Pub[Publish job] --> FTS[Postgres tsvector]
  User --> Q[Normalize Arabic query]
  Q --> FTS
  FTS --> Rank[Rank + type boosts]
  Rank --> UI["/search noindex"]
```

---

## 12. Analytics Flow

```mermaid
flowchart LR
  Page --> EV[Internal events]
  Page --> GA[GA4 optional]
  EV --> PG[(events table)]
  GSC[GSC / Bing] -.-> SEO[SEO Manager]
  PG --> Dash[Analyst dashboard]
```

---

## 13. Notification Flow

```mermaid
flowchart TB
  Event --> Q[notify.dispatch job]
  Q --> InApp[In-app inbox]
  Q --> Mail[Email future]
  Q --> Admin[Admin alert]
```

---

## 14. Feature Flag Flow

```mermaid
flowchart TB
  Admin --> Flag[(flags table)]
  Flag --> Cache[Edge/settings snapshot]
  Cache --> Nav[Nav render]
  Cache --> Routes[Route availability]
  Cache --> Sitemap[Index inclusion]
  Cache --> Auto[Automation allow]
```
