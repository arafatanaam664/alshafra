# 43 — AI Extension Points

AI is **not** a core dependency.

## Hooks (all behind `ai_assist_enabled`)

- Research assistant in CMS (suggest sources — human verifies)
- Summaries / excerpts
- Social copy drafts from templates
- Moderation assist (suggest spam; never auto-ban alone)
- Search query expansion
- Recs (later)
- FAQ draft from article body

## Rules

- Interface `AiProvider`; no single-vendor lock.
- Never auto-publish AI text without Editor.
- Never let AI change salary dates or Hijri numbers.
- No PII to third-party AI.
- Outputs labeled internally as AI-assisted in revision metadata.
