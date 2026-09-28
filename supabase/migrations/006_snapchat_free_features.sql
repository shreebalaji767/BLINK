-- BLINK free Snapchat-style feature expansion.
alter table public.stories drop constraint if exists stories_privacy_check;
alter table public.stories add constraint stories_privacy_check check (privacy in ('friends','custom','private','public'));

create table if not exists public.spotlight_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  media_path text not null,
  media_type text not null check (media_type in ('image','video')),
  caption text,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.spotlight_likes (
  post_id uuid not null references public.spotlight_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(post_id,user_id)
);

create table if not exists public.message_reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 8),
  created_at timestamptz not null default now(),
  primary key(message_id,user_id)
);

create table if not exists public.saved_messages (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key(message_id,user_id)
);

alter table public.spotlight_posts enable row level security;
alter table public.spotlight_likes enable row level security;
alter table public.message_reactions enable row level security;
alter table public.saved_messages enable row level security;

create policy spotlight_posts_select on public.spotlight_posts for select to authenticated using (true);
create policy spotlight_posts_insert on public.spotlight_posts for insert to authenticated with check ((select auth.uid())=user_id);
create policy spotlight_posts_delete on public.spotlight_posts for delete to authenticated using ((select auth.uid())=user_id);

create policy spotlight_likes_all on public.spotlight_likes for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy spotlight_likes_read on public.spotlight_likes for select to authenticated using (true);

create policy message_reactions_all on public.message_reactions for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create policy saved_messages_all on public.saved_messages for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

grant select,insert,delete on public.spotlight_posts to authenticated;
grant select,insert,delete on public.spotlight_likes to authenticated;
grant select,insert,delete on public.message_reactions to authenticated;
grant select,insert,delete on public.saved_messages to authenticated;

create index if not exists spotlight_posts_created_at_idx on public.spotlight_posts(created_at desc);
create index if not exists message_reactions_message_id_idx on public.message_reactions(message_id);
