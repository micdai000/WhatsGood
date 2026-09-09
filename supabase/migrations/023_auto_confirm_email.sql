-- Skip email confirmation so new accounts can sign in immediately.
-- Confirm email can still be turned off in the Supabase dashboard; this
-- covers hosted projects that still have the setting enabled.

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;

CREATE OR REPLACE FUNCTION public.auto_confirm_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_confirm_auth_user ON auth.users;

CREATE TRIGGER auto_confirm_auth_user
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_auth_user();
