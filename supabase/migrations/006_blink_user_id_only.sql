-- Permanent identity directory: user IDs only.
create table if not exists public.user_ids (
  id uuid primary key references auth.users(id) on delete cascade
);

alter table public.user_ids enable row level security;
revoke all on public.user_ids from anon,authenticated;
grant select on public.user_ids to authenticated;

drop policy if exists user_ids_select on public.user_ids;
create policy user_ids_select on public.user_ids
for select to authenticated using (true);

insert into public.user_ids(id)
select id from auth.users
where coalesce(is_anonymous,false)=false
on conflict(id) do nothing;

create or replace function blink_private.sync_user_id()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if coalesce(new.is_anonymous,false)=false then
    insert into public.user_ids(id) values(new.id)
    on conflict(id) do nothing;
  end if;
  return new;
end;
$$;

revoke all on function blink_private.sync_user_id() from public,anon,authenticated;

drop trigger if exists blink_sync_user_id on auth.users;
create trigger blink_sync_user_id
after insert on auth.users
for each row execute function blink_private.sync_user_id();

drop function if exists public.blink_user_exists(uuid);