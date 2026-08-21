# 26 — Media Architecture

**Store:** Cloudflare R2 (not Postgres, not git).  
**Free tier is small** — treat storage as scarce.

## Objects

Images (featured, OG, inline), avatars (later), social images, attachments, tool files (PDF calendar if real).

## Pipeline

1. Validate: type, size cap, SVG sanitization or ban SVG from users.
2. Optimize: transcode to WebP/AVIF + original.
3. Variants: `sm/md/lg/og`.
4. Metadata: width, height, alt, credit, hash (dedupe).
5. Access: public cacheable for published; signed for unpublished.
6. Cleanup: unused blobs after N days (job).

## Rules

- Editorial upload: Editor+.
- UGC upload: tighter size, malware-ish type allowlist, virus scan later; Phase 1 community may disallow uploads.
- Do not commit `og-image` replacements into git once R2 exists; keep a default fallback in repo.

## CDN

R2 + Cloudflare cache. Public site uses absolute or same-host rewritten URLs. Never `localhost`.
