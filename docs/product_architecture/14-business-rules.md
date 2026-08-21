# 14 — Business Rules

1. **URL stability:** Published public paths do not change without an ADR + redirect row.
2. **Timezone:** All Saudi calendar/salary/holiday “today” and remaining-days use `Asia/Riyadh`.
3. **Hijri:** Umm Al-Qura table; UI discloses possible ±1 day vs moon sighting for Ramadan/Eids.
4. **Weekend payday rule:** Friday → previous Thursday; Saturday → next Sunday. Applied to configured programs only.
5. **Not official:** Site is independent. Must not impersonate government.
6. **Prices:** Snapshots are indicative; execution requires a licensed party.
7. **YMYL review:** Salary, benefit, holiday, religious date content requires `reviewed_at` and at least one `Source` before index.
8. **Quality gate:** Programmatic pages cannot be indexable if unique-content threshold fails.
9. **UGC default noindex.**
10. **Ads:** Cannot render above H1 in a way that delays the answer; page can disable ads; no ads on 410/404; no ads on unpublished.
11. **Social failure isolation:** Content publish ≠ social publish.
12. **Idempotent jobs:** retries must not duplicate social posts.
13. **Flags:** Disabled section = not indexed, not in sitemap, not in primary nav.
14. **Secrets:** No social passwords stored; OAuth tokens encrypted at rest.
15. **Human over automation:** Automation cannot publish editorial without going through CMS status machine unless Super Admin sets a reviewed rule.
16. **Language:** Default locale `ar`. Other locales do not inherit indexability.
17. **Kids / prohibited:** No sexual content involving minors (refuse). Standard spam/malware blocked.
18. **PDF and downloads:** Do not advertise a file that does not exist.
19. **Canonical host:** `https://alshafra.com` (https, no trailing slash).
20. **Free-tier honesty:** If a job cannot run (quota), fail visibly in admin, do not corrupt public HTML.
