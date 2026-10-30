-- Development-only source change history; existing records are not backfilled.
create table public.source_revisions (
  id bigint generated always as identity primary key,
  source_id bigint not null references public.official_sources(id),
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now(),
  snapshot jsonb not null
);
create function public.record_source_revision() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.source_revisions(source_id, changed_by, snapshot)
    values (new.id, (select auth.uid()), to_jsonb(new));
  return new;
end $$;
revoke all on function public.record_source_revision() from public;
create trigger source_revision after insert or update on public.official_sources
  for each row execute function public.record_source_revision();
alter table public.source_revisions enable row level security;
revoke all on public.source_revisions from anon, authenticated;
grant select on public.source_revisions to authenticated;
create policy source_revisions_staff_read on public.source_revisions for select to authenticated
  using (public.editorial_role() in ('admin', 'editor', 'writer'));
