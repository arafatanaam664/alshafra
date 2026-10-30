-- Development foundation: source changes require a fresh review of linked dates.
-- Changing a source must not silently republish dates previously approved against it.
create function public.invalidate_source_dependents() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if row(old.name, old.organization, old.url, old.is_verified, old.verified_on, old.review_due)
     is distinct from
     row(new.name, new.organization, new.url, new.is_verified, new.verified_on, new.review_due) then
    update public.date_events
       set publication_status = case when publication_status = 'published' then 'draft' else publication_status end,
           date_status = 'pending', verified_on = null, review_due = null
     where source_id = old.id
       and (publication_status = 'published' or date_status <> 'pending'
            or verified_on is not null or review_due is not null);
  end if;
  return new;
end $$;
revoke all on function public.invalidate_source_dependents() from public;
create trigger source_invalidate_dependents before update on public.official_sources
  for each row execute function public.invalidate_source_dependents();
