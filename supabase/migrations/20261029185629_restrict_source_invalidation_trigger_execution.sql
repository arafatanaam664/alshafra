-- Supabase default privileges may grant EXECUTE directly to API roles.
-- Trigger invocation is internal and does not require these grants.
revoke execute on function public.invalidate_source_dependents() from anon, authenticated;
