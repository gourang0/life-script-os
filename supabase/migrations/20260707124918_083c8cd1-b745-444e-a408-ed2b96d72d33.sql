
-- 1. Missing DELETE / UPDATE policies (owner-scoped)
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own daily summaries"
  ON public.daily_summaries FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own streak freeze logs"
  ON public.streak_freeze_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_badges"
  ON public.user_badges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user_badges"
  ON public.user_badges FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal progress history"
  ON public.goal_progress_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Sanitize display_name inside the SECURITY DEFINER trigger + length constraint
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  clean_display_name TEXT;
BEGIN
  clean_display_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'display_name'), ''),
    SPLIT_PART(NEW.email, '@', 1)
  );
  clean_display_name := REGEXP_REPLACE(clean_display_name, '<[^>]*>', '', 'g');
  clean_display_name := REGEXP_REPLACE(clean_display_name, '[<>"''`]', '', 'g');
  clean_display_name := LEFT(clean_display_name, 100);
  IF clean_display_name IS NULL OR LENGTH(TRIM(clean_display_name)) = 0 THEN
    clean_display_name := SPLIT_PART(NEW.email, '@', 1);
  END IF;

  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, clean_display_name);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS display_name_length_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT display_name_length_check
  CHECK (display_name IS NULL OR LENGTH(display_name) <= 100);

-- 3. Restrict EXECUTE on SECURITY DEFINER / internal helper functions
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;

-- 4. Storage: drop broad SELECT policy that permits listing every avatar.
-- Public bucket still serves file URLs via the CDN, so avatars keep displaying.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
