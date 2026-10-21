-- When a user deletes their account, their claimed business must go with it.
-- Membership rows already cascade from auth.users, but businesses were left
-- behind and continued to appear on Home and Search.

CREATE OR REPLACE FUNCTION public.delete_claimed_business_if_orphaned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.business_members
    WHERE business_id = OLD.business_id
  ) THEN
    DELETE FROM public.businesses
    WHERE id = OLD.business_id
      AND is_claimed = true;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_business_member_removed_cleanup ON public.business_members;
CREATE TRIGGER on_business_member_removed_cleanup
  AFTER DELETE ON public.business_members
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_claimed_business_if_orphaned();

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.businesses
  WHERE id IN (
    SELECT business_id
    FROM public.business_members
    WHERE user_id = v_user_id
  );

  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

-- Claimed businesses with no remaining owner are not public listings.
DROP POLICY IF EXISTS "Active businesses are publicly readable" ON public.businesses;
CREATE POLICY "Active businesses are publicly readable"
  ON public.businesses FOR SELECT
  USING (
    status = 'active'
    AND (
      is_claimed = false
      OR EXISTS (
        SELECT 1
        FROM public.business_members m
        WHERE m.business_id = businesses.id
      )
    )
  );

-- Remove claimed businesses that already lost every member.
DELETE FROM public.businesses b
WHERE b.is_claimed = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.business_members m
    WHERE m.business_id = b.id
  );
