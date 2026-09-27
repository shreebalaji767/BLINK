-- BLINK strict retention model:
-- App-owned permanent data is only auth user identity + relationships (friendship/block).
-- Profile rows and user settings are intentionally not stored.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.search_blink_profiles(text);
drop function if exists public.get_blink_profiles(uuid[]);
drop table if exists public.user_settings cascade;
drop table if exists public.profiles cascade;

create or replace function public.blink_user_exists(target uuid)
returns boolean
language sql
security definer
set search_path=''
as $$
  select
    (select auth.uid()) is not null
    and exists(
      select 1 from auth.users
      where id=target and coalesce(is_anonymous,false)=false
    );
$$;

revoke all on function public.blink_user_exists(uuid) from public,anon;
grant execute on function public.blink_user_exists(uuid) to authenticated;

create or replace function blink_private.is_blocked(a uuid,b uuid)
returns boolean
language sql
security definer
set search_path=''
stable
as $$
  select exists(
    select 1 from public.blocks
    where blocker_id=a and blocked_id=b
  );
$$;

revoke all on function blink_private.is_blocked(uuid,uuid) from public,anon;
grant execute on function blink_private.is_blocked(uuid,uuid) to authenticated;

drop policy if exists friendships_insert on public.friendships;
create policy friendships_insert on public.friendships
for insert to authenticated
with check(
  (select auth.uid())=requester_id
  and not (select blink_private.is_blocked((select auth.uid()),addressee_id))
  and not (select blink_private.is_blocked(addressee_id,(select auth.uid())))
);

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
for insert to authenticated
with check(
  sender_id=(select auth.uid())
  and sender_bot_id is null
  and exists(
    select 1 from public.conversation_members m
    where m.conversation_id=messages.conversation_id
      and m.user_id=(select auth.uid())
  )
  and not exists(
    select 1 from public.conversation_members other
    where other.conversation_id=messages.conversation_id
      and (
        (select blink_private.is_blocked((select auth.uid()),other.user_id))
        or
        (select blink_private.is_blocked(other.user_id,(select auth.uid())))
      )
  )
);

drop policy if exists snaprec_insert on public.snap_recipients;
create policy snaprec_insert on public.snap_recipients
for insert to authenticated
with check(
  exists(
    select 1 from public.snaps s
    where s.id=snap_id and s.sender_id=(select auth.uid())
  )
  and not (select blink_private.is_blocked((select auth.uid()),recipient_id))
  and not (select blink_private.is_blocked(recipient_id,(select auth.uid())))
);