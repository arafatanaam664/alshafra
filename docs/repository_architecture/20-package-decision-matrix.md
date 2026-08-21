# 20 — Package Decision Matrix

| Package | Purpose | Why exists | Deps | Consumers | Public API | Status | Phase |
|---|---|---|---|---|---|---|---|
| calendar | Hijri + weekend rule | Phase 1 ADR; real code | none | web | hijri + applyWeekendRule | **live** | 2 |
| kernel | Result, ids | Phase 1 kernel | none | future | newId, Result | foundation | 2 |
| config | env names | prevent secret scatter | none | web | ENV_NAMES | foundation | 2 |
| ui | tokens | design system boundary | none | web, admin | brand | foundation | 2 |
| auth | AuthProvider | Phase 1 | none | admin | interfaces | contract | 2 |
| content | document types | Phase 1 | none | future CMS | types | contract | 2 |
| seo | title/canonical | H2 policy | none | web | helpers | foundation | 2 |
| search | SearchProvider | Phase 1 | none | future | interface | contract | 2 |
| media | R2 keys | Phase 1 | none | future | StorageProvider | contract | 2 |
| social | SocialProvider | Phase 1, no OAuth | none | future | interface | contract | 2 |
| notifications | types | Phase 1 | none | future | types | contract | 2 |
| analytics | event allowlist | Phase 1 | none | future | track types | contract | 2 |
| database | client kinds | forbid UI clients | none | future | assertNotBrowserService | contract | 2 |
| tools | legacy tool registry | user tools ≠ CLI | none | web | LEGACY_TOOLS | foundation | 2 |

Postponed: community, jobs, automation, monetization packages.
