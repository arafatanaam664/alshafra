# 38 — Monetization (technical)

AdSense JS is **not** imported by Content module. Layout reads `ad_placements` + flags.

`ads_enabled` false → no script (unlike legacy `index.html` always loading adsbygoogle).

Slots only if `adsense_slot_id` matches allowlist env `ADSENSE_SLOTS` (same idea as `VITE_ADSENSE_SLOTS`).

No ads: 404/410, preview, admin, above tool result island, UGC default.

Publisher id env `PUBLIC_ADSENSE_CLIENT` — not in domain code.
