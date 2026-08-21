# 44 — Accessibility

Target **WCAG 2.2 AA** where practical.

- Semantic HTML in Astro (header, main, nav, article).  
- One H1.  
- Keyboard: islands trap focus in modal; converter selects operable.  
- Visible focus rings.  
- Contrast: brand green on white already; verify gold chips.  
- `aria-label` on icon buttons.  
- `aria-current="page"` on nav.  
- Form labels not placeholders-only.  
- Skip link to `#main`.  
- Countdown: don’t require JS for the date (static text).  
- `prefers-reduced-motion`: disable smooth scroll / second ticks.

Tests: axe on SSG fixtures for HIGH URLs.
