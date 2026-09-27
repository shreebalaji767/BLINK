-- BLINK core messaging, snaps, stories and secure ephemeral media.
create extension if not exists pgcrypto;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(), kind text not null default 'direct' check (kind in ('direct','group')),
  title text, created_by uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now()
);
create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(), primary key (conversation_id,user_id)
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade, body text, media_path text,
  message_type text not null default 'text' check (message_type in ('text','image','video','voice','gif','sticker')),
  reply_to uuid references public.messages(id) on delete set null, created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '24 hours'), edited_at timestamptz, deleted_at timestamptz,
  constraint messages_content check (coalesce(length(trim(body)),0)>0 or media_path is not null)
);
create table if not exists public.snaps (
  id uuid primary key default gen_random_uuid(), sender_id uuid not null references auth.users(id) on delete cascade,
  media_path text not null, media_type text not null check (media_type in ('image','video')), caption text,
  duration_seconds integer not null default 10 check (duration_seconds between 1 and 60),
  created_at timestamptz not null default now(), expires_at timestamptz not null default (now()+interval '7 days')
);
create table if not exists public.snap_recipients (
  snap_id uuid not null references public.snaps(id) on delete cascade, recipient_id uuid not null references auth.users(id) on delete cascade,
  opened_at timestamptz, replay_count integer not null default 0 check (replay_count between 0 and 1),
  screenshot_reported_at timestamptz, primary key (snap_id,recipient_id)
);
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  media_path text not null, media_type text not null check (media_type in ('image','video')), caption text,
  privacy text not null default 'friends' check (privacy in ('friends','custom','private')),
  created_at timestamptz not null default now(), expires_at timestamptz not null default (now()+interval '24 hours')
);
create table if not exists public.story_recipients (story_id uuid not null references public.stories(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,primary key(story_id,user_id));
create table if not exists public.story_views (story_id uuid not null references public.stories(id) on delete cascade,viewer_id uuid not null references auth.users(id) on delete cascade,viewed_at timestamptz not null default now(),primary key(story_id,viewer_id));

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.snaps enable row level security;
alter table public.snap_recipients enable row level security;
alter table public.stories enable row level security;
alter table public.story_recipients enable row level security;
alter table public.story_views enable row level security;

drop policy if exists conv_select on public.conversations; create policy conv_select on public.conversations for select to authenticated using (exists(select 1 from public.conversation_members m where m.conversation_id=id and m.user_id=(select auth.uid())));
drop policy if exists conv_insert on public.conversations; create policy conv_insert on public.conversations for insert to authenticated with check ((select auth.uid())=created_by);
drop policy if exists members_select on public.conversation_members; create policy members_select on public.conversation_members for select to authenticated using (exists(select 1 from public.conversation_members me where me.conversation_id=conversation_id and me.user_id=(select auth.uid())));
drop policy if exists members_insert on public.conversation_members; create policy members_insert on public.conversation_members for insert to authenticated with check (exists(select 1 from public.conversations c where c.id=conversation_id and c.created_by=(select auth.uid())) or user_id=(select auth.uid()));
drop policy if exists messages_select on public.messages; create policy messages_select on public.messages for select to authenticated using (exists(select 1 from public.conversation_members m where m.conversation_id=messages.conversation_id and m.user_id=(select auth.uid())) and expires_at>now());
drop policy if exists messages_insert on public.messages; create policy messages_insert on public.messages for insert to authenticated with check ((select auth.uid())=sender_id and exists(select 1 from public.conversation_members m where m.conversation_id=messages.conversation_id and m.user_id=(select auth.uid())));
drop policy if exists messages_update on public.messages; create policy messages_update on public.messages for update to authenticated using ((select auth.uid())=sender_id) with check ((select auth.uid())=sender_id);
drop policy if exists messages_delete on public.messages; create policy messages_delete on public.messages for delete to authenticated using ((select auth.uid())=sender_id);
drop policy if exists snaps_select on public.snaps; create policy snaps_select on public.snaps for select to authenticated using ((select auth.uid())=sender_id or exists(select 1 from public.snap_recipients r where r.snap_id=id and r.recipient_id=(select auth.uid())));
drop policy if exists snaps_insert on public.snaps; create policy snaps_insert on public.snaps for insert to authenticated with check ((select auth.uid())=sender_id);
drop policy if exists snaprec_select on public.snap_recipients; create policy snaprec_select on public.snap_recipients for select to authenticated using ((select auth.uid())=recipient_id or exists(select 1 from public.snaps s where s.id=snap_id and s.sender_id=(select auth.uid())));
drop policy if exists snaprec_insert on public.snap_recipients; create policy snaprec_insert on public.snap_recipients for insert to authenticated with check (exists(select 1 from public.snaps s where s.id=snap_id and s.sender_id=(select auth.uid())));
drop policy if exists snaprec_update on public.snap_recipients; create policy snaprec_update on public.snap_recipients for update to authenticated using ((select auth.uid())=recipient_id) with check ((select auth.uid())=recipient_id);
drop policy if exists stories_select on public.stories; create policy stories_select on public.stories for select to authenticated using ((select auth.uid())=user_id or exists(select 1 from public.friendships f where f.status='accepted' and ((f.requester_id=(select auth.uid()) and f.addressee_id=stories.user_id) or (f.requester_id=stories.user_id and f.addressee_id=(select auth.uid())))) or exists(select 1 from public.story_recipients r where r.story_id=id and r.user_id=(select auth.uid())));
drop policy if exists stories_insert on public.stories; create policy stories_insert on public.stories for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists storyrec_select on public.story_recipients; create policy storyrec_select on public.story_recipients for select to authenticated using ((select auth.uid())=user_id or exists(select 1 from public.stories s where s.id=story_id and s.user_id=(select auth.uid())));
drop policy if exists storyrec_insert on public.story_recipients; create policy storyrec_insert on public.story_recipients for insert to authenticated with check (exists(select 1 from public.stories s where s.id=story_id and s.user_id=(select auth.uid())));
drop policy if exists storyviews_all on public.story_views; create policy storyviews_all on public.story_views for all to authenticated using ((select auth.uid())=viewer_id or exists(select 1 from public.stories s where s.id=story_id and s.user_id=(select auth.uid()))) with check ((select auth.uid())=viewer_id);

grant select,insert on public.conversations to authenticated;
grant select,insert on public.conversation_members to authenticated;
grant select,insert,update,delete on public.messages to authenticated;
grant select,insert on public.snaps to authenticated;
grant select,insert,update on public.snap_recipients to authenticated;
grant select,insert on public.stories to authenticated;
grant select,insert on public.story_recipients to authenticated;
grant select,insert,update,delete on public.story_views to authenticated;

do $$ begin
if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='messages') then alter publication supabase_realtime add table public.messages; end if;
if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='snap_recipients') then alter publication supabase_realtime add table public.snap_recipients; end if;
end $$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('blink-ephemeral','blink-ephemeral',false,52428800,array['image/jpeg','image/png','image/webp','video/mp4','video/webm','audio/webm','audio/ogg']) on conflict(id) do update set public=false;

drop policy if exists blink_media_insert on storage.objects;
create policy blink_media_insert on storage.objects for insert to authenticated with check(bucket_id='blink-ephemeral' and (storage.foldername(name))[1]=(select auth.uid()::text));
drop policy if exists blink_media_select on storage.objects;
create policy blink_media_select on storage.objects for select to authenticated using(bucket_id='blink-ephemeral' and ((storage.foldername(name))[1]=(select auth.uid()::text) or exists(select 1 from public.messages m join public.conversation_members cm on cm.conversation_id=m.conversation_id where m.media_path=name and cm.user_id=(select auth.uid())) or exists(select 1 from public.snap_recipients sr where sr.snap_id=split_part(name,'/',3)::uuid and sr.recipient_id=(select auth.uid())) or exists(select 1 from public.stories s where s.media_path=name and (s.user_id=(select auth.uid()) or exists(select 1 from public.friendships f where f.status='accepted' and ((f.requester_id=(select auth.uid()) and f.addressee_id=s.user_id) or (f.requester_id=s.user_id and f.addressee_id=(select auth.uid())))) or exists(select 1 from public.story_recipients r where r.story_id=s.id and r.user_id=(select auth.uid())))));
drop policy if exists blink_media_delete on storage.objects;
create policy blink_media_delete on storage.objects for delete to authenticated using(bucket_id='blink-ephemeral' and (storage.foldername(name))[1]=(select auth.uid()::text));

create or replace function public.search_blink_profiles(term text)
returns table(id uuid,username text,display_name text,avatar_url text)
language sql security definer set search_path=public,pg_catalog as $$ select p.id,p.username,p.display_name,p.avatar_url from public.profiles p where auth.uid() is not null and p.id<>auth.uid() and (term is null or lower(coalesce(p.username,'')||' '||coalesce(p.display_name,'')) like '%'||lower(term)||'%') order by p.username nulls last limit 30; $$;
revoke all on function public.search_blink_profiles(text) from public,anon; grant execute on function public.search_blink_profiles(text) to authenticated;

create or replace function public.get_blink_profiles(ids uuid[])
returns table(id uuid,username text,display_name text,avatar_url text)
language sql security definer set search_path=public,pg_catalog as $$ select p.id,p.username,p.display_name,p.avatar_url from public.profiles p where p.id=any(ids) and auth.uid() is not null limit 100; $$;
revoke all on function public.get_blink_profiles(uuid[]) from public,anon; grant execute on function public.get_blink_profiles(uuid[]) to authenticated;

create or replace function public.get_or_create_direct_conversation(other_user uuid)
returns uuid language plpgsql security definer set search_path=public,pg_catalog as $$
declare me uuid:=auth.uid(); cid uuid;
begin
if me is null or other_user is null or me=other_user then raise exception 'invalid participant'; end if;
if not exists(select 1 from public.friendships f where f.status='accepted' and ((f.requester_id=me and f.addressee_id=other_user) or (f.requester_id=other_user and f.addressee_id=me))) then raise exception 'friendship required'; end if;
select c.id into cid from public.conversations c where c.kind='direct' and exists(select 1 from public.conversation_members m where m.conversation_id=c.id and m.user_id=me) and exists(select 1 from public.conversation_members m where m.conversation_id=c.id and m.user_id=other_user) limit 1;
if cid is null then insert into public.conversations(kind,created_by) values('direct',me) returning id into cid; insert into public.conversation_members(conversation_id,user_id) values(cid,me),(cid,other_user); end if;
return cid;
end $$;
revoke all on function public.get_or_create_direct_conversation(uuid) from public,anon; grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;