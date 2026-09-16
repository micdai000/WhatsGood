-- Business onboarding helpers: atomic setup RPC and claim requests.

-- ===========================================================================
-- complete_business_onboarding
-- Creates business + owner membership (via trigger) + primary location + QR
-- in a single transaction.
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.complete_business_onboarding(
  p_name TEXT,
  p_slug TEXT,
  p_category_id UUID,
  p_description TEXT DEFAULT NULL,
  p_website_url TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_logo_url TEXT DEFAULT NULL,
  p_address_line_1 TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_postal_code TEXT DEFAULT NULL,
  p_country TEXT DEFAULT 'US',
  p_qr_code TEXT DEFAULT NULL,
  p_qr_label TEXT DEFAULT 'Primary Business QR'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_business public.businesses;
  v_location public.business_locations;
  v_qr public.business_qr_codes;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_name IS NULL OR length(trim(p_name)) < 2 THEN
    RAISE EXCEPTION 'Business name is required' USING ERRCODE = '22023';
  END IF;

  IF p_slug IS NULL OR length(trim(p_slug)) < 1 THEN
    RAISE EXCEPTION 'Business slug is required' USING ERRCODE = '22023';
  END IF;

  IF p_category_id IS NULL THEN
    RAISE EXCEPTION 'Business category is required' USING ERRCODE = '22023';
  END IF;

  IF p_city IS NULL OR length(trim(p_city)) < 1 OR p_state IS NULL OR length(trim(p_state)) < 1 THEN
    RAISE EXCEPTION 'City and state are required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.businesses (
    slug,
    name,
    description,
    logo_url,
    website_url,
    phone,
    email,
    category_id,
    is_claimed
  )
  VALUES (
    trim(p_slug),
    trim(p_name),
    NULLIF(trim(p_description), ''),
    NULLIF(trim(p_logo_url), ''),
    NULLIF(trim(p_website_url), ''),
    NULLIF(trim(p_phone), ''),
    NULLIF(trim(p_email), ''),
    p_category_id,
    true
  )
  RETURNING * INTO v_business;

  INSERT INTO public.business_locations (
    business_id,
    address_line_1,
    city,
    state,
    postal_code,
    country,
    is_primary
  )
  VALUES (
    v_business.id,
    NULLIF(trim(p_address_line_1), ''),
    trim(p_city),
    trim(p_state),
    NULLIF(trim(p_postal_code), ''),
    COALESCE(NULLIF(trim(p_country), ''), 'US'),
    true
  )
  RETURNING * INTO v_location;

  INSERT INTO public.business_qr_codes (
    business_id,
    location_id,
    code,
    label
  )
  VALUES (
    v_business.id,
    v_location.id,
    COALESCE(NULLIF(trim(p_qr_code), ''), encode(extensions.gen_random_bytes(16), 'hex')),
    COALESCE(NULLIF(trim(p_qr_label), ''), 'Primary Business QR')
  )
  RETURNING * INTO v_qr;

  RETURN jsonb_build_object(
    'business', to_jsonb(v_business),
    'location', to_jsonb(v_location),
    'qr_code', to_jsonb(v_qr)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.complete_business_onboarding(
  TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_business_onboarding(
  TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

-- ===========================================================================
-- business_claim_requests
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.business_claim_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_claim_requests_business_id
  ON public.business_claim_requests (business_id);
CREATE INDEX IF NOT EXISTS idx_business_claim_requests_user_id
  ON public.business_claim_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_business_claim_requests_status
  ON public.business_claim_requests (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_claim_requests_one_pending
  ON public.business_claim_requests (business_id, user_id)
  WHERE status = 'pending';

DROP TRIGGER IF EXISTS on_business_claim_request_updated ON public.business_claim_requests;
CREATE TRIGGER on_business_claim_request_updated
  BEFORE UPDATE ON public.business_claim_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.business_claim_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their claim requests" ON public.business_claim_requests;
CREATE POLICY "Users can view their claim requests"
  ON public.business_claim_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users can request to claim unclaimed businesses" ON public.business_claim_requests;
CREATE POLICY "Users can request to claim unclaimed businesses"
  ON public.business_claim_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_id
        AND b.is_claimed = false
        AND b.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can cancel their pending claim requests" ON public.business_claim_requests;
CREATE POLICY "Users can cancel their pending claim requests"
  ON public.business_claim_requests FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'cancelled');

DROP POLICY IF EXISTS "Admins can update claim requests" ON public.business_claim_requests;
CREATE POLICY "Admins can update claim requests"
  ON public.business_claim_requests FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE ON public.business_claim_requests TO authenticated;

SELECT pg_notify('pgrst', 'reload schema');
