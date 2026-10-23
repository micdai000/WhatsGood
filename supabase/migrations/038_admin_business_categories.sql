-- Admins manage business categories from the admin panel, so they must be
-- able to see inactive categories in order to re-enable them.

DROP POLICY IF EXISTS "Admins can view all categories" ON public.business_categories;
CREATE POLICY "Admins can view all categories"
  ON public.business_categories FOR SELECT
  USING (public.is_admin());
