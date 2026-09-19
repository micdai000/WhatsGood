-- Policy subqueries on business_members are subject to that table's RLS,
-- so anonymous Home/Search queries could not see claimed businesses.
-- Evaluate membership through a security-definer helper instead.

CREATE OR REPLACE FUNCTION public.business_has_members(_business_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.business_members
    WHERE business_id = _business_id
  );
$$;

REVOKE ALL ON FUNCTION public.business_has_members(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.business_has_members(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.business_has_members(UUID) TO authenticated;

DROP POLICY IF EXISTS "Active businesses are publicly readable" ON public.businesses;
CREATE POLICY "Active businesses are publicly readable"
  ON public.businesses FOR SELECT
  USING (
    status = 'active'
    AND (
      is_claimed = false
      OR public.business_has_members(id)
    )
  );
