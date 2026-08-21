# 33 — Monetization

Monetization must not defeat UX or SEO.

## Future methods (flags)

AdSense (already partially integrated), affiliate, direct ads, sponsored content (labeled), premium tools, subscriptions, services.

## Ad slots

Named slots: `in_article`, `sidebar`, `after_tool`. Not dummy numeric ids.

Rules:

- Render only if `ads_enabled` site flag AND page `ads_enabled` AND real slot ids configured (`VITE_ADSENSE_SLOTS` pattern today).
- No ads on 404/410, preview, admin, thin UGC, or above the primary answer of a tool (H1 + result).
- Reserve min-height to reduce CLS.
- Label إعلان.
- Keep `ads.txt`.

## Sponsored

Must be labeled. No mixing into YMYL salary numbers.

## Phase 1

Keep AdSense plumbing gated off until policy/content bar is met. Do not invent extra networks.
