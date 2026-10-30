-- Development only: synthetic accounts and records are rolled back.
begin;
select set_config('test.post_grants_editor',gen_random_uuid()::text,true);
insert into auth.users(id) values (current_setting('test.post_grants_editor')::uuid);
insert into public.admin_profiles(user_id, role) values (current_setting('test.post_grants_editor')::uuid, 'editor');
select set_config('request.jwt.claim.sub',current_setting('test.post_grants_editor'),true);
set local role authenticated;
insert into public.official_sources(name,organization,url,verified_on,review_due,is_verified) values ('post-grants-source','test','https://example.invalid/one',(now() at time zone 'Asia/Riyadh')::date,(now() at time zone 'Asia/Riyadh')::date + 10,true);
insert into public.date_events(slug,title,program,event_date,date_status,publication_status,source_id,verified_on,review_due) select 'post-grants-event','test','test',current_date + 5,'official','published',id,(now() at time zone 'Asia/Riyadh')::date,(now() at time zone 'Asia/Riyadh')::date + 10 from public.official_sources where name='post-grants-source';
insert into public.articles(slug,title,status,author_id) values ('post-grants-article','test','draft',auth.uid());
update public.articles set title='updated' where slug='post-grants-article';
update public.official_sources set url='https://example.invalid/two' where name='post-grants-source';
do $$ begin
  if not exists (select 1 from public.date_events where slug='post-grants-event' and publication_status='draft' and date_status='pending') then raise exception 'invalidation failed'; end if;
  if (select count(*) from public.event_revisions where snapshot->>'slug'='post-grants-event') <> 2 then raise exception 'event history failed'; end if;
  if (select count(*) from public.article_revisions where snapshot->>'slug'='post-grants-article') <> 2 then raise exception 'article history failed'; end if;
  if (select count(*) from public.source_revisions where snapshot->>'name'='post-grants-source') <> 2 then raise exception 'source history failed'; end if;
end $$;
reset role;
select 'trigger functions work after revoke; fixtures rolled back' as result;
rollback;
