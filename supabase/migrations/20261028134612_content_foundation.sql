-- Development foundation only. Bootstrap the first administrator separately in the SQL editor.
-- No application may render body as HTML without sanitization.
create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'editor', 'writer')),
  created_at timestamptz not null default now()
);

create function public.editorial_role() returns text
language sql stable security definer set search_path = ''
as $$ select role from public.admin_profiles where user_id = (select auth.uid()) $$;
revoke all on function public.editorial_role() from public;
grant execute on function public.editorial_role() to anon, authenticated;

create table public.articles (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(title) between 1 and 200),
  description text not null default '' check (length(description) <= 500),
  body jsonb not null default '[]'::jsonb check (jsonb_typeof(body) = 'array'),
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  author_id uuid not null references auth.users(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or published_at is not null)
);

create table public.article_revisions (
  id bigint generated always as identity primary key,
  article_id bigint not null references public.articles(id),
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now(),
  snapshot jsonb not null
);

create function public.record_article_revision() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.article_revisions(article_id, changed_by, snapshot)
    values (new.id, (select auth.uid()), to_jsonb(new));
  return new;
end $$;
revoke all on function public.record_article_revision() from public;
create trigger article_revision after insert or update on public.articles
  for each row execute function public.record_article_revision();

-- AFTER triggers cannot modify NEW; set the timestamp in a separate BEFORE trigger.
create function public.touch_article() returns trigger
language plpgsql set search_path = '' as $$ begin new.updated_at := now(); return new; end $$;
revoke all on function public.touch_article() from public;
create trigger article_touch before update on public.articles
  for each row execute function public.touch_article();

alter table public.admin_profiles enable row level security;
alter table public.articles enable row level security;
alter table public.article_revisions enable row level security;
revoke all on public.admin_profiles, public.articles, public.article_revisions from anon, authenticated;
grant select on public.admin_profiles to authenticated;
grant select on public.articles to anon, authenticated;
grant insert, update on public.articles to authenticated;
grant select on public.article_revisions to authenticated;
grant usage, select on sequence public.articles_id_seq to authenticated;

create policy profiles_read_own on public.admin_profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy articles_read_public on public.articles for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy articles_read_staff on public.articles for select to authenticated
  using (public.editorial_role() in ('admin', 'editor') or
    (public.editorial_role() = 'writer' and author_id = (select auth.uid())));
create policy articles_insert_staff on public.articles for insert to authenticated
  with check ((public.editorial_role() in ('admin', 'editor') or
    (public.editorial_role() = 'writer' and status in ('draft', 'review'))) and
    author_id = (select auth.uid()));
create policy articles_update_staff on public.articles for update to authenticated
  using (public.editorial_role() in ('admin', 'editor') or
    (public.editorial_role() = 'writer' and author_id = (select auth.uid()) and status in ('draft', 'review')))
  with check (public.editorial_role() in ('admin', 'editor') or
    (public.editorial_role() = 'writer' and author_id = (select auth.uid()) and status in ('draft', 'review')));
create policy revisions_read_staff on public.article_revisions for select to authenticated
  using (public.editorial_role() in ('admin', 'editor') or
    (public.editorial_role() = 'writer' and exists
      (select 1 from public.articles a where a.id = article_id and a.author_id = (select auth.uid()))));
