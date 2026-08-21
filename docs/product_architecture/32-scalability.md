# 32 — Scalability Architecture

## Style

**Modular monolith**, not microservices.

## Modules (deployed together, bounded)

Identity, Content, Tools, Community, Search, Media, SEO, Social, Automation, Notifications, Analytics, Moderation, Monetization, Admin, Calendar (can sit under Tools but keep a boundary because of YMYL).

Each module:

- public API (functions/events)
- own tables prefixed
- no cross-table writes except via API
- feature flag

A module **may** be split later (e.g. Social worker) without rewriting domain.

## Data growth

- Events table: partition/sample
- Jobs: delete succeeded after N days
- Media: quota alerts
- UGC: quality gate so index does not grow with spam

## Traffic

Static files absorb read traffic. Dynamic: auth, search, votes, CMS.

Free-tier limits: see `37-deployment.md` and `47-risk-register.md`.
