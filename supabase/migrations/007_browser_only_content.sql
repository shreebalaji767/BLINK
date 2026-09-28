-- BLINK browser-only content
-- Chats, Snaps, Stories, Spotlight, reactions, saved messages and computer-bot data
-- are intentionally not persisted in the database. They live only in the user's browser.
-- Keep only account/profile data, friendships, and block relationships in public tables.

drop table if exists public.saved_messages cascade;
drop table if exists public.message_reactions cascade;
drop table if exists public.spotlight_likes cascade;
drop table if exists public.spotlight_posts cascade;
drop table if exists public.story_views cascade;
drop table if exists public.story_recipients cascade;
drop table if exists public.stories cascade;
drop table if exists public.snap_recipients cascade;
drop table if exists public.snaps cascade;
drop table if exists public.messages cascade;
drop table if exists public.conversation_bots cascade;
drop table if exists public.conversation_members cascade;
drop table if exists public.conversations cascade;
drop table if exists public.ephemeral_messages cascade;
drop table if exists public.blink_bots cascade;
drop table if exists public.bot_profiles cascade;
drop table if exists public.user_ids cascade;
