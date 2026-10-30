-- Disposable development project only. All fixtures and modifications roll back.
begin;
select set_config('test.source_editor',gen_random_uuid()::text,true), set_config('test.source_writer',gen_random_uuid()::text,true);
insert into auth.users(id) select current_setting(k)::uuid from unnest(array['test.source_editor','test.source_writer']) as k;
insert into public.admin_profiles(user_id,role) values (current_setting('test.source_editor')::uuid,'editor'),(current_setting('test.source_writer')::uuid,'writer');
select set_config('request.jwt.claim.sub',current_setting('test.source_editor'),true);
set local role authenticated;
insert into public.official_sources(name,organization,url,verified_on,review_due,is_verified) values ('invalidate-test','test','https://example.invalid/one',(now() at time zone 'Asia/Riyadh')::date,(now() at time zone 'Asia/Riyadh')::date + 10,true);
insert into public.date_events(slug,title,program,event_date,date_status,publication_status,source_id,verified_on,review_due)
select 'invalidate-event','test','test',(now() at time zone 'Asia/Riyadh')::date + 5,'official','published',id,(now() at time zone 'Asia/Riyadh')::date,(now() at time zone 'Asia/Riyadh')::date + 10 from public.official_sources where name='invalidate-test';
-- A no-op update does not revoke a valid event.
update public.official_sources set name=name where name='invalidate-test';
do $$ begin if not exists (select 1 from public.date_events where slug='invalidate-event' and publication_status='published') then raise exception 'no-op source update revoked event'; end if; end $$;
update public.official_sources set url='https://example.invalid/two' where name='invalidate-test';
do $$ begin if not exists (select 1 from public.date_events where slug='invalidate-event' and publication_status='draft' and date_status='pending' and verified_on is null and review_due is null) then raise exception 'source change failed to revoke event approval'; end if; if (select count(*) from public.event_revisions where snapshot->>'slug'='invalidate-event') <> 2 then raise exception 'event invalidation missing from history'; end if; end $$;
-- Reverification must not automatically republish.
update public.official_sources set is_verified=false,verified_on=null,review_due=null where name='invalidate-test';
update public.official_sources set is_verified=true,verified_on=(now() at time zone 'Asia/Riyadh')::date,review_due=(now() at time zone 'Asia/Riyadh')::date + 10 where name='invalidate-test';
reset role;
set local role anon;
do $$ begin if exists (select 1 from public.date_events where slug='invalidate-event') then raise exception 'reverification republished event'; end if; end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('test.source_writer'),true);
set local role authenticated;
do $$ begin update public.official_sources set name='writer-illegal' where name='invalidate-test'; if found then raise exception 'writer modified source'; end if; end $$;
reset role;
select 'source invalidation tests passed; fixtures rolled back' as result;
rollback;
