# Phase 16 — Brand consistency

Visible user text vs SEO-only metadata. Old name may remain as `alternateName` in JSON-LD.

| PAGE | CURRENT BRAND | OLD BRAND PRESENT? | VISIBLE TO USER? | SEO ONLY? | ACTION |
|---|---|---|---|---|---|
| `/` | Alshafra | JSON-LD alternateName | No | Yes | Keep |
| `/calendar` | Alshafra | JSON-LD alternateName | No | Yes | Keep |
| `/tools` | Alshafra | JSON-LD alternateName | No | Yes | Keep |
| `/tool/percentage` | Alshafra | JSON-LD alternateName | No | Yes | Keep |
| `/articles` | Alshafra | JSON-LD alternateName | No | Yes | Keep |
| `/trending` | Alshafra | JSON-LD alternateName | No | Yes | Keep |
| `/search` | Alshafra | JSON-LD alternateName | No | Yes | Keep |
| `/privacy` | Alshafra | JSON-LD alternateName | No | Yes | Keep |
| `/terms` | Alshafra | JSON-LD alternateName | No | Yes | Keep |
| `/about` | عن Alshafra | JSON-LD alternateName | No | Yes | Keep |
| `/contact` | تواصل مع Alshafra | JSON-LD alternateName | No | Yes | Keep |
| `/404` | Alshafra | No | No | — | Aligned static colors |
| `/410` | Alshafra | No | No | — | Aligned static colors |
| 127 HIGH titles | content + `\| Alshafra` | No in title | No | — | Not rewritten again |
| Header / Footer | Alshafra | No | No | — | Keep |
| JSON-LD Organization | name Alshafra | alternateName تقويم السعودية | No | Yes | Keep for SEO |

`apps/web-legacy` still contains the old Vite brand. That app is rollback only and is not the public renderer on this branch.
