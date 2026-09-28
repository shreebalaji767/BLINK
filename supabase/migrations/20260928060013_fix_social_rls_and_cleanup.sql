-- Restore the final browser-only social relationship access model.
drop policy if exists friendships_insert on public.friendships;
create policy friendships_insert on public.friendships
for insert to authenticated
with check (
  (select auth.uid()) = requester_id
  and requester_id <> addressee_id
  and not exists (
    select 1 from public.blocks b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = addressee_id)
       or (b.blocker_id = addressee_id and b.blocked_id = (select auth.uid()))
  )
);

drop policy if exists friendships_delete on public.friendships;
create policy friendships_delete on public.friendships
for delete to authenticated
using (
  (select auth.uid()) = requester_id
  or (select auth.uid()) = addressee_id
);

grant select, insert, update, delete on public.friendships to authenticated;
grant select, insert, delete on public.blocks to authenticated;

create unique index if not exists friendships_pair_unique
on public.friendships (
  least(requester_id, addressee_id),
  greatest(requester_id, addressee_id)
);
