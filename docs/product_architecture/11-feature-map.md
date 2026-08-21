# 11 — Feature Map

Legend: **On** = exists in legacy and stays. **Spec** = designed, flag off. **P1** = first implementation wave.

| Feature | Module | Flag | Wave |
|---|---|---|---|
| Hijri/Gregorian conversion | Tools/Calendar | `tools_enabled` | **On / P1** |
| Today in Riyadh | Tools/Calendar | `tools_enabled` | **On** |
| Hijri month calendar | Tools/Calendar | `tools_enabled` | **On** |
| Salaries + weekend rule | Tools/Calendar | `tools_enabled` | **On** |
| School calendar | Tools/Calendar | `education_enabled` | **On** |
| Holidays | Tools/Calendar | `tools_enabled` | **On** |
| Countdowns | Tools/Calendar | `tools_enabled` | **On** |
| Age calculator | Tools | `tools_enabled` | **On** |
| Gold prices | Tools | `tools_enabled` | **On** |
| USD rates | Tools | `tools_enabled` | **On** |
| Name decoration | Tools | `tools_enabled` | P1 (prerender) |
| Editorial articles | Content | — | **On / CMS P1** |
| Trending/guides | Content | `trends_enabled` | **On / quality P1** |
| New homepage | Content | — | P1 |
| CMS workflow | CMS | — | P1 |
| Revisions | CMS | — | P1 |
| Categories/tags | Content | — | P1 |
| Internal linking engine | SEO | — | P1 (replace prerender heuristic) |
| Sitemap index | SEO | — | P1 |
| Redirect/410 registry | SEO | — | P1 |
| Feature flags admin | Admin | — | P1 |
| Media on R2 | Media | — | P1 (minimal) |
| Auth email/Google | Identity | `registration_enabled` | P1 off by default |
| Comments | Community | `comments_enabled` | Spec |
| Questions/answers | Community | `community_enabled` | Spec |
| Votes, follows, bookmarks | Community | `community_enabled` | Spec |
| Reputation/badges | Community | `community_enabled` | Spec |
| Moderation queue | Moderation | `community_enabled` | Spec |
| UGC quality gate | SEO/Moderation | `community_enabled` | Spec |
| Internal search | Search | `advanced_search_enabled` | P1 basic, advanced later |
| Share buttons | Social | — | P1 |
| Social auto-publish | Social | `social_auto_publish_enabled` | Spec |
| Automation rules | Automation | — | Spec |
| Job queue | Queue | — | P1 (cron + table) |
| Notifications in-app | Notifications | — | Spec |
| Email notifications | Notifications | — | Future |
| AdSense slots | Monetization | `ads_enabled` | P1 gated |
| Affiliate/sponsored | Monetization | flags | Future |
| AI assist | AI | `ai_assist_enabled` | Spec, not core |
| Jobs/scholarships/travel hubs | Content | respective flags | Later |
| Public API | — | — | Future |
| PWA/offline | — | — | Future |

## Dependency sketch

```
Identity → CMS → Content → SEO → Search
                 ↘ Tools
                 ↘ Media
Community → Moderation → Notifications
CMS → Automation → Queue → Social
Flags wrap all of the above
```
