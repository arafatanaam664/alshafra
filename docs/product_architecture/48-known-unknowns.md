# 48 — Known / Unknown / Needs Verification / Future Decision

## KNOWN (in repo / live fetch 2026-08-20)

- 127 published Arabic URLs in `published.json`.
- Stack is Vite+React SPA + prerender, no DB/auth/CMS.
- Hijri via ICU Umm Al-Qura; Riyadh timezone.
- Weekend payday rule implemented.
- AdSense pub id `ca-pub-9822552442964714` and `ads.txt`.
- IndexNow key file present.
- Quality gate 1500 words at prerender.
- 410 intended for `/category/*`, `/languages/*`, `/news/*` in Netlify files.
- Name decoration not in sitemap.
- i18n 16 languages in files; gold/USD titles use شفرة تولز.
- Live homepage is تقويم السعودية and functional.
- GitHub Action commits prices to `main`.
- Env names: `VITE_ADSENSE_ENABLED`, `VITE_ADSENSE_SLOTS` only.

## UNKNOWN

- Actual Google index composition today.
- Backlink set.
- Whether AdSense is approved or still in review.
- Real traffic mix Google vs Bing vs direct.
- Who the legal entity/operator is beyond `info@alshafra.com`.
- Whether PDF calendar file was ever generated outside repo.

## NEEDS VERIFICATION (ops, not invented)

- Production DNS target (Vercel vs Netlify vs Cloudflare) **today**.
- HTTP status of `https://alshafra.com/category/artificial-intelligence` (410 vs 404 vs 200).
- HTTP status of `/name-decoration` and `/en`.
- GSC property exists?
- Bing Webmaster property exists? (IndexNow suggests intent.)
- Core Web Vitals field data.
- Whether `islamic-umalqura` matches KACST for 1449+ (probe exists for 1448-01-01 = 2026-06-16).
- AdSense account state.
- Supabase project existence (none in code).
- R2 bucket existence (none in code).
- Reported Bing positions still true on 2026-08-20.

## FUTURE DECISION (human)

See `49-phase-1-readiness.md`:

- Display name lock (Alshafra vs dual brand).
- Title suffix on calendar pages.
- Astro+islands vs Next.js on Cloudflare.
- When to enable registration/community.
- Whether to keep 16-language catalog at all.
- Cutover date from Vercel/Netlify to Cloudflare.
- Whether `/trending/today` stays indexable.
- Monthly salary URL program (`/salaries/.../august-2026`) — Phase 0 default **no**, unless uniqueness is real.
