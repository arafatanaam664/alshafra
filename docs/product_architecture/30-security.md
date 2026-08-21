# 30 — Security Architecture

## AuthN

- Visitor: none
- User: Supabase Auth (email magic/password, Google). Interface `AuthProvider` so domain is not stuck on Supabase.
- Session: httpOnly secure cookies / Supabase SSR pattern; no tokens in localStorage for admin if avoidable.

## AuthZ

RBAC (`12-user-roles.md`, `52-permission-matrix.md`). Checked server-side for CMS/admin/API. Never trust client flags.

## Session

Short sessions for admin. CSRF: same-site cookies + origin check on mutations.

## OAuth tokens (social)

Encrypted at rest, scoped, rotatable, displayed never in full. Disconnect revokes.

## Input / XSS

CMS body sanitized to allowlist. UGC stricter (no raw HTML). CSP in headers (evolve from current Netlify/Vercel headers).

## SQL

Parameterized only (Supabase client / SQL with binds). No string-built queries.

## Uploads

Type/size allowlist, no executable, image re-encode (strips XSS in SVG if SVG allowed at all — default deny SVG from UGC).

## Rate limiting

Edge (Cloudflare) + application (posting).

## API

Admin API not public. Public read is static. Future public API: keys, rate limit, no secrets.

## Secrets

`.env` gitignored. Workers secrets. Never commit service role keys.

## Audit

Admin and moderation actions.

## Current headers to keep

X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS.
