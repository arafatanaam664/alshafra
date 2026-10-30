-- Development only: no event dates or source claims are seeded.
create table public.official_sources (
  id bigint generated always as identity primary key,
  name text not null check (length(name) between 1 and 200),
  organization text not null check (length(organization) between 1 and 200),
  url text not null check (url ~ '^https://[^[:space:]]+$' and length(url) <= 2048),
  verified_on date,
  review_due date,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_verified or (verified_on is not null and review_due is not null and review_due >= verified_on))
);
create table public.date_events (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(title) between 1 and 200),
  program text not null check (length(program) between 1 and 200),
  event_date date,
  timezone text not null default 'Asia/Riyadh' check (timezone = 'Asia/Riyadh'),
  audience text not null default '' check (length(audience) <= 200),
  region text not null default '' check (length(region) <= 200),
  date_status text not null default 'pending' check (date_status in ('official', 'usual', 'estimated', 'pending', 'expired')),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'published', 'archived')),
  source_id bigint references public.official_sources(id),
  verified_on date,
  review_due date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (review_due is null or verified_on is not null and review_due >= verified_on),
  check (publication_status <> 'published' or (date_status = 'official' and event_date is not null and source_id is not null and verified_on is not null and review_due is not null))
);
create table public.event_revisions (
  id bigint generated always as identity primary key,
  event_id bigint not null references public.date_events(id),
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now(),
  snapshot jsonb not null
);
create function public.touch_editorial_record() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
revoke all on function public.touch_editorial_record() from public;
create trigger touch_source before update on public.official_sources for each row execute function public.touch_editorial_record();
create trigger touch_event before update on public.date_events for each row execute function public.touch_editorial_record();
create function public.record_event_revision() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.event_revisions(event_id, changed_by, snapshot) values (new.id, (select auth.uid()), to_jsonb(new)); return new; end $$;
revoke all on function public.record_event_revision() from public;
create trigger event_revision after insert or update on public.date_events for each row execute function public.record_event_revision();
alter table public.official_sources enable row level security;
alter table public.date_events enable row level security;
alter table public.event_revisions enable row level security;
revoke all on public.official_sources, public.date_events, public.event_revisions from anon, authenticated;
grant select on public.official_sources, public.date_events to anon, authenticated;
grant insert, update on public.official_sources, public.date_events to authenticated;
grant select on public.event_revisions to authenticated;
grant usage, select on sequence public.official_sources_id_seq, public.date_events_id_seq to authenticated;
create policy sources_public on public.official_sources for select to anon, authenticated using
  (is_verified and verified_on <= (now() at time zone 'Asia/Riyadh')::date and review_due >= (now() at time zone 'Asia/Riyadh')::date);
create policy sources_staff_read on public.official_sources for select to authenticated using (public.editorial_role() in ('admin', 'editor', 'writer'));
create policy sources_staff_insert on public.official_sources for insert to authenticated with check (public.editorial_role() in ('admin', 'editor'));
create policy sources_staff_update on public.official_sources for update to authenticated using (public.editorial_role() in ('admin', 'editor')) with check (public.editorial_role() in ('admin', 'editor'));
create policy events_public on public.date_events for select to anon, authenticated using
  (publication_status = 'published' and date_status = 'official'
   and verified_on <= (now() at time zone 'Asia/Riyadh')::date
   and review_due >= (now() at time zone 'Asia/Riyadh')::date
   and exists (select 1 from public.official_sources s where s.id = source_id and s.is_verified
     and s.verified_on <= (now() at time zone 'Asia/Riyadh')::date and s.review_due >= (now() at time zone 'Asia/Riyadh')::date));
create policy events_staff_read on public.date_events for select to authenticated using (public.editorial_role() in ('admin', 'editor', 'writer'));
create policy events_staff_insert on public.date_events for insert to authenticated with check (public.editorial_role() in ('admin', 'editor'));
create policy events_staff_update on public.date_events for update to authenticated using (public.editorial_role() in ('admin', 'editor')) with check (public.editorial_role() in ('admin', 'editor'));
create policy event_revisions_staff_read on public.event_revisions for select to authenticated using (public.editorial_role() in ('admin', 'editor', 'writer'));
