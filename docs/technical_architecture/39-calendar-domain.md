# 39 — Calendar Domain

**Port legacy engines, do not rewrite math.**

Package `packages/calendar` (framework-agnostic):

| Export | Source today |
|---|---|
| `gregorianToHijri`, `hijriToGregorian`, `todayGregorian` (Asia/Riyadh), `isUmmAlQuraExact` | `src/lib/hijri.ts` |
| `applyWeekendRule`, `nextSalaryDate`, `buildSalaryInstances` | `src/lib/events.ts` |
| `resolveCountdown` | `src/lib/countdowns.ts` + `scripts/countdowns.mjs` — **one TS implementation** used by Astro build and islands |

Config from DB (`calendar_programs`, `calendar_events`, `countdown_definitions`) with JSON fallback seed from current files.

## Invariants

- Storage UTC; display Riyadh for this domain.  
- Moon-sighting disclaimer in UI copy.  
- If ICU probe fails at build: fail the build or freeze last `hijri_month_lengths` snapshot — **do not silent-tabular** without `engine: 'tabular_fallback'` in HTML meta for editors.  
- Probe: 2026-06-16 → 1 Muharram 1448.

## Consumers

Astro pages, React islands, future API `GET /public/convert` (optional, not required v1 — island computes locally).

UI (Astro/React) **imports the package**; it does not copy algorithms.
