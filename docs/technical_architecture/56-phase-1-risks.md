# 56 — Phase 1 Risks

| ID | Risk | P | I | Mitigation |
|---|---|---|---|---|
| T1 | Astro migration misses a 127 URL | M | H | Matrix 62 + CI |
| T2 | Soft 404 returns | M | H | no fallback; 404 test |
| T3 | 410 missing on CF | M | H | generate `_redirects` |
| T4 | Supabase pause | M | H | cron ping |
| T5 | 500 MB DB | M | M | retention jobs |
| T6 | Workers 10ms CPU | H | M | no image sync; chunk jobs |
| T7 | Dual enforce RLS vs BFF drift | M | H | tests |
| T8 | Service role leaked to client | L | H | CI grep |
| T9 | Title suffix regression vs H2 | M | M | layout unit test |
| T10 | Brand «تقويم السعودية» leftover in layout | H | L | H1 checklist |
| T11 | Import loses path | M | H | row count 127 |
| T12 | ICU missing in CF build image | L | H | probe + snapshot |
| T13 | Preview noindex leak to prod | L | H | env check |
| T14 | Circular Content↔SEO | M | M | compute function in kernel |
| T15 | Free-tier numbers wrong | M | M | verify at kickoff |
