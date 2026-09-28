drop policy if exists "BLINK users can receive private broadcasts" on realtime.messages;
create policy "BLINK users can receive private broadcasts"
on realtime.messages for select
to authenticated
using (
  extension = 'broadcast'
  and private = true
  and topic = 'blink-user:' || (select auth.uid())::text
);

drop policy if exists "BLINK friends can send private broadcasts" on realtime.messages;
create policy "BLINK friends can send private broadcasts"
on realtime.messages for insert
to authenticated
with check (
  extension = 'broadcast'
  and private = true
  and (payload->>'sender_id')::uuid = (select auth.uid())
  and topic = 'blink-user:' || (payload->>'recipient_id')
  and exists (
    select 1
    from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = (select auth.uid()) and f.addressee_id = (payload->>'recipient_id')::uuid)
        or
        (f.addressee_id = (select auth.uid()) and f.requester_id = (payload->>'recipient_id')::uuid)
      )
  )
  and not exists (
    select 1 from public.blocks b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = (payload->>'recipient_id')::uuid)
       or (b.blocker_id = (payload->>'recipient_id')::uuid and b.blocked_id = (select auth.uid()))
  )
);
