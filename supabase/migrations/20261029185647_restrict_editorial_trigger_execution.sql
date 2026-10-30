-- Trigger functions do not need direct API-role execution grants.
revoke execute on function public.record_article_revision(), public.record_event_revision(), public.record_source_revision(), public.touch_article(), public.touch_editorial_record() from anon, authenticated;
