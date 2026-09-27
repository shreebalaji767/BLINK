-- BLINK retention policy: user content is ephemeral. Permanent app relationships are separate.
create schema if not exists blink_private;
create extension if not exists pgcrypto;
create extension if not exists pg_net;

create table if not exists blink_private.cleanup_auth (
  id boolean primary key default true check (id),
  token_hash text not null
);

create table if not exists public.bot_profiles (
  id uuid primary key default gen_random_uuid(),
  bot_key text not null unique,
  display_name text not null,
  avatar_emoji text not null default '💻',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_bots (
  conversation_id uuid primary key references public.conversations(id) on delete cascade,
  bot_id uuid not null references public.bot_profiles(id) on delete cascade
);

alter table public.bot_profiles enable row level security;
alter table public.conversation_bots enable row level security;

alter table public.messages alter column sender_id drop not null;
alter table public.messages add column if not exists sender_bot_id uuid references public.bot_profiles(id) on delete set null;

alter table public.messages drop constraint if exists messages_content;
alter table public.messages add constraint messages_sender_check check (
  (sender_id is not null and sender_bot_id is null)
  or (sender_id is null and sender_bot_id is not null)
);
alter table public.messages add constraint messages_content check (
  coalesce(length(trim(body)),0)>0 or media_path is not null
);

insert into public.bot_profiles(bot_key,display_name,avatar_emoji)
values
('computer','BLINK Computer','💻'),
('arcade','BLINK Arcade','🎮'),
('helper','BLINK Helper','🛰️')
on conflict(bot_key) do update
set display_name=excluded.display_name, avatar_emoji=excluded.avatar_emoji;

-- Only users in the conversation can see its live messages.
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
for select to authenticated
using (
  expires_at>now()
  and exists (
    select 1 from public.conversation_members m
    where m.conversation_id=messages.conversation_id
      and m.user_id=(select auth.uid())
  )
);

-- Clients may only create messages as themselves. Bot messages are server-created.
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
for insert to authenticated
with check (
  sender_id=(select auth.uid())
  and sender_bot_id is null
  and exists (
    select 1 from public.conversation_members m
    where m.conversation_id=messages.conversation_id
      and m.user_id=(select auth.uid())
  )
);

drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
for update to authenticated
using (sender_id=(select auth.uid()))
with check (sender_id=(select auth.uid()) and sender_bot_id is null);

drop policy if exists messages_delete on public.messages;
create policy messages_delete on public.messages
for delete to authenticated
using (sender_id=(select auth.uid()));

drop policy if exists bots_select on public.bot_profiles;
create policy bots_select on public.bot_profiles
for select to authenticated
using (enabled=true);

drop policy if exists conversation_bots_select on public.conversation_bots;
create policy conversation_bots_select on public.conversation_bots
for select to authenticated
using (
  exists (
    select 1 from public.conversation_members m
    where m.conversation_id=conversation_id
      and m.user_id=(select auth.uid())
  )
);

drop policy if exists conversation_bots_insert on public.conversation_bots;
create policy conversation_bots_insert on public.conversation_bots
for insert to authenticated
with check (
  exists (
    select 1 from public.conversation_members m
    where m.conversation_id=conversation_id
      and m.user_id=(select auth.uid())
  )
);

grant select on public.bot_profiles to authenticated;
grant select,insert on public.conversation_bots to authenticated;
grant select,insert,update,delete on public.messages to authenticated;

-- Hard-delete expired database rows.
create or replace function blink_private.cleanup_expired_rows()
returns void
language plpgsql
security definer
set search_path=public,blink_private,pg_catalog
as $$
begin
  delete from public.story_views
  where story_id in (select id from public.stories where expires_at<=now());

  delete from public.story_recipients
  where story_id in (select id from public.stories where expires_at<=now());

  delete from public.stories where expires_at<=now();

  delete from public.snap_recipients
  where snap_id in (select id from public.snaps where expires_at<=now());

  delete from public.snaps where expires_at<=now();

  delete from public.messages where expires_at<=now();
end;
$$;

revoke all on schema blink_private from public,anon,authenticated;
revoke all on blink_private.cleanup_auth from public,anon,authenticated;
revoke all on function blink_private.cleanup_expired_rows() from public,anon,authenticated;