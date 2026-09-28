-- Final BLINK storage model.
-- Persistent application data is limited to user identity/profile data and relationships.
-- Chats, messages, Snaps, Stories, Memories, Spotlight items, reactions and saved messages are browser-local/ephemeral.

DROP TABLE IF EXISTS public.message_reactions CASCADE;
DROP TABLE IF EXISTS public.saved_messages CASCADE;
DROP TABLE IF EXISTS public.spotlight_likes CASCADE;
DROP TABLE IF EXISTS public.spotlight_posts CASCADE;
DROP TABLE IF EXISTS public.story_views CASCADE;
DROP TABLE IF EXISTS public.story_recipients CASCADE;
DROP TABLE IF EXISTS public.stories CASCADE;
DROP TABLE IF EXISTS public.snap_recipients CASCADE;
DROP TABLE IF EXISTS public.snaps CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_bots CASCADE;
DROP TABLE IF EXISTS public.bot_profiles CASCADE;
DROP TABLE IF EXISTS public.conversation_members CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.ephemeral_messages CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user_profile() CASCADE;
DROP FUNCTION IF EXISTS blink_private.is_blocked(uuid,uuid) CASCADE;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_username_length CHECK (char_length(username) BETWEEN 3 AND 24),
  CONSTRAINT profiles_username_format CHECK (username ~ '^[a-z0-9_]+$')
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key ON public.profiles (lower(username));
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update their own username" ON public.profiles;
CREATE POLICY "Users can update their own username"
ON public.profiles FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

CREATE OR REPLACE FUNCTION public.make_unique_username(p_email text, p_requested text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  suffix integer := 0;
BEGIN
  base := lower(regexp_replace(coalesce(nullif(trim(p_requested), ''), split_part(coalesce(p_email, 'blink_user'), '@', 1)), '[^a-z0-9_]+', '_', 'g'));
  base := trim(both '_' from base);
  IF char_length(base) < 3 THEN base := 'blink_user'; END IF;
  base := left(base, 24);
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = lower(candidate)) LOOP
    suffix := suffix + 1;
    candidate := left(base, 24 - char_length(suffix::text) - 1) || '_' || suffix::text;
  END LOOP;
  RETURN candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, public.make_unique_username(NEW.email, NEW.raw_user_meta_data ->> 'username'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM public, anon, authenticated;
