# @alshafra/auth

Identity port. Staff authorization lives in `@alshafra/cms`.

Phase 15 completed the server-only Supabase access-token verifier (`verifySupabaseAccessToken`). It must never run in a browser bundle. The service role key stays on the server.

**Does not own:** profiles, reputation, UI, role grants.
