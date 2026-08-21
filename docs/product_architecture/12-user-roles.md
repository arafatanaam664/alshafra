# 12 — User Roles

Full matrix: `52-permission-matrix.md`.

## Roles

| Role | Who |
|---|---|
| Visitor | Anonymous |
| User | Registered |
| Trusted User | Reputation / manual grant |
| Moderator | UGC + reports |
| Editor | Editorial content |
| SEO Manager | Canonical, robots, redirects, sitemap, titles |
| Social Manager | Connections, templates, publish jobs |
| Analyst | Analytics dashboards, no publish |
| Admin | Settings, flags, users |
| Super Admin | Break-glass, audit, role grants |

Roles are additive. A person may be Editor + SEO Manager.

## Role vs module (summary)

| | Visitor | User | Trusted | Mod | Editor | SEO | Social | Analyst | Admin | Super |
|---|---|---|---|---|---|---|---|---|---|---|
| Read public | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Use tools | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Register | ✓ | | | | | | | | | |
| Ask/answer | | ✓* | ✓ | ✓ | | | | | | |
| Vote | | ✓* | ✓ | ✓ | | | | | | |
| Skip some UGC limits | | | ✓ | | | | | | | |
| Moderate UGC | | | | ✓ | | | | | ✓ | ✓ |
| Draft/publish editorial | | | | | ✓ | | | | ✓ | ✓ |
| Edit SEO fields | | | | | limited | ✓ | | | ✓ | ✓ |
| Social publish | | | | | | | ✓ | | ✓ | ✓ |
| View analytics | | | | | limited | ✓ | limited | ✓ | ✓ | ✓ |
| Feature flags | | | | | | | | | ✓ | ✓ |
| Manage roles | | | | | | | | | | ✓ |

\*If `community_enabled` and `registration_enabled`.

## Ownership

- **Editorial quality:** Editor
- **Indexability overrides:** SEO Manager (Editors cannot force-index UGC)
- **Legal/ban:** Admin + Moderator
- **Secrets/OAuth apps:** Super Admin
