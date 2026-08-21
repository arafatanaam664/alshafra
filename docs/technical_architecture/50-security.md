# 50 — Security (technical)

- AuthN/Z as 19–20; RLS 07.  
- CSRF: same-site cookies + `Origin` check on mutating `/api`.  
- XSS: sanitize body; CSP: `default-src 'self'; script-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com; img-src 'self' https: data:; connect-src 'self' https://*.supabase.co` — tighten in implementation.  
- Uploads: allowlist, re-encode, no SVG.  
- Rate limits 25. Turnstile on auth.  
- Secrets in env; social ciphertext.  
- Headers keep: nosniff, referrer strict-origin-when-cross-origin, permissions-policy, HSTS.  
- Admin: session timeout 12h.  
- Dependency: `npm audit` in CI.  
- No service role in client bundle (CI grep).

Tests: XSS payload in excerpt rejected; CSRF from other origin 403; RLS draft leak.
