# 24 — Validation

**Zod** at three layers:

1. **HTTP input** — parse body/query, 400 on fail  
2. **Domain** — state machine (cannot publish without title/path/category for YMYL sources)  
3. **DB** — checks/enums (last line)

Same schemas in `packages/domain` imported by Astro islands (client forms) and API.

No `as any` at boundaries. Extra keys stripped (`.strict()` on admin writes).

HTML body: sanitize to allowlist (`p,h2,h3,ul,ol,li,a[href],table,thead,tbody,tr,th,td,strong,em,blockquote,code`). No `script`, no `style` except from CMS image figures.
