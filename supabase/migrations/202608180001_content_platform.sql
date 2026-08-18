-- Alshafra editorial platform (Supabase/PostgreSQL)
-- Apply once with the Supabase SQL editor or CLI. Public sign-up must remain
-- disabled in Auth settings; the first administrator is promoted manually.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('viewer', 'author', 'editor', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.content_status as enum ('draft', 'review', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.content_type as enum ('article', 'fault_code', 'maintenance_guide', 'tool_guide', 'landing_page');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role public.app_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  type public.content_type not null default 'article',
  status public.content_status not null default 'draft',
  locale text not null default 'ar' check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  canonical_path text not null,
  slug text not null,
  title text not null check (char_length(title) between 10 and 220),
  seo_title text,
  description text not null check (char_length(description) between 50 and 500),
  body_markdown text not null default '',
  keywords text[] not null default '{}',
  sources jsonb not null default '[]'::jsonb check (jsonb_typeof(sources) = 'array'),
  cover_image_url text,
  cover_image_alt text,
  author_name text,
  reviewer_name text,
  indexable boolean not null default false,
  published_at timestamptz,
  scheduled_for timestamptz,
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  updated_by uuid references public.profiles(id) on delete set null default auth.uid(),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  constraint canonical_path_format check (
    canonical_path ~ '^/[a-z0-9][a-z0-9/_-]*$'
    and canonical_path !~ '/$'
    and canonical_path <> '/admin'
    and canonical_path !~ '^/admin/'
  ),
  constraint published_requirements check (
    status <> 'published'
    or (
      published_at is not null
      and char_length(body_markdown) >= 100
      and jsonb_array_length(sources) > 0
      and nullif(trim(reviewer_name), '') is not null
      and (cover_image_url is null or nullif(trim(cover_image_alt), '') is not null)
    )
  ),
  constraint indexable_only_when_published check (not indexable or status = 'published'),
  unique (locale, canonical_path)
);

create index if not exists content_items_publication_idx
  on public.content_items (status, indexable, locale, published_at desc);
create index if not exists content_items_updated_idx on public.content_items (updated_at desc);
create index if not exists content_items_scheduled_idx on public.content_items (scheduled_for)
  where scheduled_for is not null and status <> 'published';

create table if not exists public.content_revisions (
  id bigint generated always as identity primary key,
  content_id uuid not null references public.content_items(id) on delete cascade,
  revision_number integer not null,
  snapshot jsonb not null,
  change_note text,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (content_id, revision_number)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 8388608),
  width integer,
  height integer,
  locale text not null default 'ar',
  alt_text text,
  caption text,
  license_name text,
  license_url text,
  attribution text,
  uploaded_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint media_rights_metadata check (
    mime_type = 'application/pdf'
    or (nullif(trim(alt_text), '') is not null and nullif(trim(license_name), '') is not null)
  )
);

create table if not exists public.source_records (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  label text not null,
  url text not null check (url ~ '^https://'),
  source_type text,
  page_reference text,
  accessed_at date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists source_records_content_idx on public.source_records (content_id, sort_order);

create table if not exists public.content_translations (
  source_content_id uuid not null references public.content_items(id) on delete cascade,
  translated_content_id uuid not null references public.content_items(id) on delete cascade,
  translation_status text not null default 'draft' check (translation_status in ('draft', 'review', 'approved')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  primary key (source_content_id, translated_content_id),
  check (source_content_id <> translated_content_id)
);

create table if not exists public.redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique check (source_path ~ '^/'),
  destination_path text check (destination_path is null or destination_path ~ '^/'),
  http_status smallint not null check (http_status in (301, 302, 307, 308, 410)),
  reason text not null,
  evidence jsonb not null default '{}'::jsonb,
  active boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((http_status = 410 and destination_path is null) or (http_status <> 410 and destination_path is not null)),
  check (destination_path is null or source_path <> destination_path)
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

-- Role lookup used by RLS. Users cannot change their own role through this function.
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'viewer'::public.app_role);
$$;
revoke all on function public.current_app_role() from public;
grant execute on function public.current_app_role() to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_content_audit_fields()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  if new.status <> 'published' then new.indexable := false; end if;
  if new.status = 'published' and old.status is distinct from 'published' then
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists content_items_audit_fields on public.content_items;
create trigger content_items_audit_fields
  before update on public.content_items
  for each row execute function public.set_content_audit_fields();

create or replace function public.capture_content_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_number integer;
begin
  select coalesce(max(revision_number), 0) + 1 into next_number
  from public.content_revisions where content_id = old.id;
  insert into public.content_revisions (content_id, revision_number, snapshot, created_by)
  values (old.id, next_number, to_jsonb(old), auth.uid());
  return new;
end;
$$;

drop trigger if exists content_items_revision on public.content_items;
create trigger content_items_revision
  before update on public.content_items
  for each row
  when (old.* is distinct from new.*)
  execute function public.capture_content_revision();

create or replace function public.log_editorial_action()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_id text;
  row_status text;
begin
  if tg_op = 'DELETE' then
    row_id := old.id::text;
    row_status := old.status::text;
  else
    row_id := new.id::text;
    row_status := new.status::text;
  end if;
  insert into public.audit_log (actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), lower(tg_op), tg_table_name, row_id, jsonb_build_object('status', row_status));
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

drop trigger if exists content_items_audit_log on public.content_items;
create trigger content_items_audit_log
  after insert or update or delete on public.content_items
  for each row execute function public.log_editorial_action();

-- Row-level security
alter table public.profiles enable row level security;
alter table public.content_items enable row level security;
alter table public.content_revisions enable row level security;
alter table public.media_assets enable row level security;
alter table public.source_records enable row level security;
alter table public.content_translations enable row level security;
alter table public.redirects enable row level security;
alter table public.audit_log enable row level security;

create policy "profiles_read_self_or_admin" on public.profiles for select to authenticated
  using (id = auth.uid() or public.current_app_role() = 'admin');
create policy "profiles_admin_update" on public.profiles for update to authenticated
  using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

create policy "published_content_is_public" on public.content_items for select to anon, authenticated
  using (status = 'published' and indexable = true and published_at <= now());
create policy "staff_can_read_all_content" on public.content_items for select to authenticated
  using (public.current_app_role() in ('author', 'editor', 'admin'));
create policy "authors_can_create_content" on public.content_items for insert to authenticated
  with check (public.current_app_role() in ('author', 'editor', 'admin') and created_by = auth.uid());
create policy "editors_can_update_all_content" on public.content_items for update to authenticated
  using (public.current_app_role() in ('editor', 'admin'))
  with check (public.current_app_role() in ('editor', 'admin'));
create policy "authors_can_update_own_drafts" on public.content_items for update to authenticated
  using (public.current_app_role() = 'author' and created_by = auth.uid() and status in ('draft', 'review'))
  with check (public.current_app_role() = 'author' and created_by = auth.uid() and status in ('draft', 'review') and indexable = false);
create policy "admins_can_delete_content" on public.content_items for delete to authenticated
  using (public.current_app_role() = 'admin');

create policy "staff_can_read_revisions" on public.content_revisions for select to authenticated
  using (public.current_app_role() in ('author', 'editor', 'admin'));
create policy "editors_can_restore_revisions" on public.content_revisions for insert to authenticated
  with check (public.current_app_role() in ('editor', 'admin'));

create policy "published_media_metadata_is_public" on public.media_assets for select to anon, authenticated using (true);
create policy "staff_can_add_media_metadata" on public.media_assets for insert to authenticated
  with check (public.current_app_role() in ('author', 'editor', 'admin') and uploaded_by = auth.uid());
create policy "editors_can_update_media_metadata" on public.media_assets for update to authenticated
  using (public.current_app_role() in ('editor', 'admin')) with check (public.current_app_role() in ('editor', 'admin'));
create policy "admins_can_delete_media_metadata" on public.media_assets for delete to authenticated
  using (public.current_app_role() = 'admin');

create policy "sources_follow_public_content" on public.source_records for select to anon, authenticated
  using (exists (select 1 from public.content_items c where c.id = content_id and c.status = 'published' and c.indexable));
create policy "staff_manage_sources" on public.source_records for all to authenticated
  using (public.current_app_role() in ('author', 'editor', 'admin'))
  with check (public.current_app_role() in ('author', 'editor', 'admin'));

create policy "approved_translations_are_public" on public.content_translations for select to anon, authenticated
  using (
    translation_status = 'approved'
    and exists (select 1 from public.content_items c where c.id = source_content_id and c.status = 'published' and c.indexable and c.published_at <= now())
    and exists (select 1 from public.content_items c where c.id = translated_content_id and c.status = 'published' and c.indexable and c.published_at <= now())
  );
create policy "editors_manage_translations" on public.content_translations for all to authenticated
  using (public.current_app_role() in ('editor', 'admin')) with check (public.current_app_role() in ('editor', 'admin'));

create policy "staff_read_redirects" on public.redirects for select to authenticated
  using (public.current_app_role() in ('author', 'editor', 'admin'));
create policy "editors_manage_redirects" on public.redirects for all to authenticated
  using (public.current_app_role() in ('editor', 'admin')) with check (public.current_app_role() in ('editor', 'admin'));
create policy "admins_read_audit_log" on public.audit_log for select to authenticated
  using (public.current_app_role() = 'admin');

-- Public media bucket. Upload/delete still require the object policies below.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public_can_read_media" on storage.objects for select to public
  using (bucket_id = 'media');
create policy "editorial_staff_can_upload_media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.current_app_role() in ('author', 'editor', 'admin'));
create policy "editors_can_update_media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.current_app_role() in ('editor', 'admin'))
  with check (bucket_id = 'media' and public.current_app_role() in ('editor', 'admin'));
create policy "admins_can_delete_media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.current_app_role() = 'admin');
