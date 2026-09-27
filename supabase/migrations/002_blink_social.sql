-- BLINK social foundation. User content is intentionally ephemeral.
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ghost_mode boolean not null default true,
  story_privacy text not null default 'friends' check (story_privacy in ('friends','custom','private')),
  chat_delete_mode text not null default 'after_viewing' check (chat_delete_mode in ('after_viewing','24h')),
  theme text not null default 'system' check (theme in ('system','light','dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Messages are explicitly temporary. A cleanup job should delete expired rows.
create table if not exists public.ephemeral_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  conversation_id uuid,
  body text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  viewed_at timestamptz
);

alter table public.friendships enable row level security;
alter table public.blocks enable row level security;
alter table public.user_settings enable row level security;
alter table public.ephemeral_messages enable row level security;

drop policy if exists friendships_select on public.friendships;
create policy friendships_select on public.friendships for select to authenticated
using ((select auth.uid()) = requester_id or (select auth.uid()) = addressee_id);

drop policy if exists friendships_insert on public.friendships;
create policy friendships_insert on public.friendships for insert to authenticated
with check ((select auth.uid()) = requester_id);

drop policy if exists friendships_update on public.friendships;
create policy friendships_update on public.friendships for update to authenticated
using ((select auth.uid()) = requester_id or (select auth.uid()) = addressee_id)
with check ((select auth.uid()) = requester_id or (select auth.uid()) = addressee_id);

drop policy if exists blocks_all on public.blocks;
create policy blocks_all on public.blocks for all to authenticated
using ((select auth.uid()) = blocker_id)
with check ((select auth.uid()) = blocker_id);

drop policy if exists settings_select on public.user_settings;
create policy settings_select on public.user_settings for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists settings_insert on public.user_settings;
create policy settings_insert on public.user_settings for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists settings_update on public.user_settings;
create policy settings_update on public.user_settings for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists messages_select on public.ephemeral_messages;
create policy messages_select on public.ephemeral_messages for select to authenticated
using ((select auth.uid()) = sender_id or (select auth.uid()) = recipient_id);

drop policy if exists messages_insert on public.ephemeral_messages;
create policy messages_insert on public.ephemeral_messages for insert to authenticated
with check ((select auth.uid()) = sender_id);

drop policy if exists messages_update on public.ephemeral_messages;
create policy messages_update on public.ephemeral_messages for update to authenticated
using ((select auth.uid()) = recipient_id or (select auth.uid()) = sender_id)
with check ((select auth.uid()) = recipient_id or (select auth.uid()) = sender_id);

grant select, insert, update on public.friendships to authenticated;
grant select, insert, update, delete on public.blocks to authenticated;
grant select, insert, update on public.user_settings to authenticated;
grant select, insert, update on public.ephemeral_messages to authenticated;

-- No anonymous access.
revoke all on public.friendships from anon;
revoke all on public.blocks from anon;
revoke all on public.user_settings from anon;
revoke all on public.ephemeral_messages from anon;
