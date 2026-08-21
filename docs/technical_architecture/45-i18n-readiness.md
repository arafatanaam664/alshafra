# 45 — i18n Readiness (do not build 16 languages)

- `documents.locale` default `ar`.  
- UI strings: dictionary `ar` only in v1 (`packages/ui/messages/ar.json`).  
- Routing: no `/ar` prefix.  
- Do not generate `/{lang}` hubs. Footer **must not** link 404 locales (legacy footer is a bug to fix at cutover).  
- hreflang only when a real translation document exists.  
- Future: `locale` + `translation_of_id` on documents.

Catalog i18n JSON in repo is **not imported**.
