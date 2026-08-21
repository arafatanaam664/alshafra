# 30 — Social Architecture

Flag `social_auto_publish_enabled` default false.

Content publish **never** waits on social. Event `content.published` → Automation → `social.publish.requested` jobs.

Secrets: `token_ref` is a pointer to Cloudflare Worker secret / Supabase Vault. **Not** plaintext in Postgres. Encryption at rest if vault unavailable: libsodium sealed in env-master-key (`SOCIAL_TOKEN_KEY` 32-byte) — ciphertext in a `secrets` table isolated, not in `social_accounts` dump to logs.

Disconnect: revoke + delete ciphertext.
