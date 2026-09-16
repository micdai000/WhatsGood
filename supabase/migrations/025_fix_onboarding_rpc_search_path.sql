-- Fix complete_business_onboarding search_path so pgcrypto is visible.
-- 024 set search_path = public only, which cannot resolve gen_random_bytes.

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

SELECT pg_notify('pgrst', 'reload schema');
