-- Run only on a disposable development project, never production.
-- Uses generated auth users and rolls all fixture data back.
begin;
select set_config('test.writer', gen_random_uuid()::text, true), set_config('test.editor', gen_random_uuid()::text, true), set_config('test.admin', gen_random_uuid()::text, true), set_config('test.regular', gen_random_uuid()::text, true);
insert into auth.users(id) select current_setting(k)::uuid from unnest(array['test.writer','test.editor','test.admin','test.regular']) as k;
insert into public.admin_profiles(user_id,role) values (current_setting('test.writer')::uuid,'writer'),(current_setting('test.editor')::uuid,'editor'),(current_setting('test.admin')::uuid,'admin');
insert into public.articles(slug,title,status,author_id,published_at) values ('test-draft','draft','draft',current_setting('test.writer')::uuid,null),('test-published','published','published',current_setting('test.editor')::uuid,now() - interval '1 day'),('test-future','future','published',current_setting('test.editor')::uuid,now() + interval '1 day');
set local role anon;
do $$ begin if (select count(*) from public.articles) <> 1 then raise exception 'anon visibility failed'; end if; end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('test.regular'),true);
set local role authenticated;
do $$ begin if (select count(*) from public.articles) <> 1 then raise exception 'regular visibility failed'; end if; begin insert into public.articles(slug,title,author_id) values ('test-denied','denied',auth.uid()); raise exception 'regular insert allowed'; exception when insufficient_privilege then null; end; end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('test.writer'),true);
set local role authenticated;
do $$ begin if (select count(*) from public.articles) <> 2 then raise exception 'writer visibility failed'; end if; insert into public.articles(slug,title,author_id) values ('test-own','own',auth.uid()); begin update public.articles set status='published',published_at=now() where slug='test-own'; raise exception 'writer publication allowed'; exception when insufficient_privilege then null; end; begin update public.admin_profiles set role='admin' where user_id=auth.uid(); raise exception 'role update allowed'; exception when insufficient_privilege then null; end; if (select count(*) from public.article_revisions where snapshot->>'slug'='test-own') <> 1 then raise exception 'revision missing'; end if; end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('test.editor'),true);
set local role authenticated;
do $$ begin if (select count(*) from public.articles) <> 4 then raise exception 'editor visibility failed'; end if; update public.articles set status='published',published_at=now() where slug='test-own'; if not found then raise exception 'editor publication failed'; end if; end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('test.admin'),true);
set local role authenticated;
do $$ begin if (select count(*) from public.articles) <> 4 then raise exception 'admin visibility failed'; end if; if (select count(*) from public.article_revisions where snapshot->>'slug'='test-own') <> 2 then raise exception 'revision history failed'; end if; end $$;
reset role;
select 'RLS role smoke tests passed; all fixtures rolled back' as result;
rollback;
