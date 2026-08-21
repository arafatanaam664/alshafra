# 36 — Settings

Grouped, versioned, audited.

| Group | Examples |
|---|---|
| Site | name, tagline, logo, default locale, timezone `Asia/Riyadh`, contact email |
| SEO | site_url, title suffix, default OG, robots extra, GSC/Bing verification tokens |
| Social | default templates, utm |
| Community | min lengths, new-user limits, index thresholds |
| Moderation | auto-hide rules |
| Ads | client id, slot map |
| Analytics | GA id |
| Localization | enabled locales |
| Feature flags | see 34 |

Public site reads a **published settings snapshot**. Draft settings do not affect CDN HTML until save+purge.
