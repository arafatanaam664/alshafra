# 55 — Self-Review & Cross-Document Consistency

Performed after drafting all Phase 0 docs. Fixes applied in-place in the same files where noted.

## Checks

| Check | Result |
|---|---|
| Content model matches CMS | Yes — same statuses, fields, editorial vs UGC split |
| CMS matches SEO | Publish side effects: sitemap, canonical, indexable computed |
| SEO matches Search | Only indexable documents in FTS and sitemap |
| Linking uses same Topic/Category | Yes |
| Community not mixed into `/articles` | Yes |
| Analytics events listed in 27 match journeys | Yes |
| Social isolated from publish | Yes, ADR-013/015 |
| 127 URL counts consistent | Audit, inventory, matrix, summary |
| `/category/` never reused | URL architecture + IA |
| Flags defaults consistent | 11, 34, 16 |
| No Phase 1 schema/API dumped here | Observed |
| No traffic promises | Observed (explicit) |
| Brand dual naming documented | Yes, human decision |

## Contradictions found and resolved

1. **1500-word gate vs quality-over-quantity**  
   Resolution: keep a quality gate, but count **unique** content, not padding. Documented in 03, 04, 21, 45.

2. **`/trending` TRANSFORM vs KEEP URL**  
   Resolution: TRANSFORM role/UI, KEEP path.

3. **MERGE vs no 301**  
   Resolution: MERGE means internal unification + cross-links; 301 is a future decision.

4. **Astro vs Next**  
   Resolution: ADR-004 leaves a spike; both must satisfy HTML-without-JS for articles.

5. **tools hub `/adawat` vs `/tools`**  
   Resolution: NO DECISION; do not advertise until quality; legacy tools stay at old paths.

6. **education_enabled vs school calendar on**  
   Resolution: school calendar stays on even if education section hub is off.

7. **travel_enabled false vs `/trending` travel URLs**  
   Resolution: flags must not 404 existing indexed URLs.

8. **SITE_NAME تقويم السعودية vs vision Alshafra**  
   Resolution: human H1; `alternateName` required.

## Remaining tensions (not bugs)

- Mixed URL aesthetics (legacy vs new) — accepted by ADR-003.
- Gold titles say شفرة تولز — brand cleanup after H1.
- Free tier vs community scale — community stays off.

## Missing modules?  

Calendar is nested under Tools but called out as YMYL boundary (32). Sufficient.

## Missing permissions?

Matrix in 52 covers asked roles. Trusted User “skip link limits” included.

## Missing failure cases?

Social partial failure, ICU fallback, price API fail, job DLQ, 410 host mismatch — covered.

## URL conflicts?

`/category/` old vs new taxonomy — forbidden reuse.  
`/articles` Saudi vs catalog world — `/world` unpublished, no decision.

## Duplicate responsibilities?

Prerender related-links vs linking engine — latter replaces former.  
GitHub Action vs queue prices job — Action becomes backup.

## Ownership

Editorial: Editor. Index overrides: SEO Manager. Social: Social Manager. Flags: Admin.

## Infrastructure assumptions

Cloudflare+Supabase+R2 are **target**, not currently wired. Legacy is Vercel/Netlify. Stated in 01, 37, 48.

## Free-tier / social / UGC risks

In 47. Defaults: community off, social auto off, ads gated.
