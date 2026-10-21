-- Surface constraint failures from onboarding as validation errors,
-- and require an existing category so create-business does not return HTTP 409.

CREATE OR REPLACE FUNCTION public.handle_business_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.business_members (business_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'owner')
    ON CONFLICT (business_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

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
  p_qr_label TEXT DEFAULT 'Primary Business QR',
  p_custom_category TEXT DEFAULT NULL
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
  v_category_slug text;
  v_custom_category text;
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

  SELECT slug INTO v_category_slug
  FROM public.business_categories
  WHERE id = p_category_id
    AND is_active = true;

  IF v_category_slug IS NULL THEN
    RAISE EXCEPTION 'Please select a valid business category' USING ERRCODE = '22023';
  END IF;

  v_custom_category := NULLIF(trim(p_custom_category), '');

  IF v_category_slug = 'other' THEN
    IF v_custom_category IS NULL OR char_length(v_custom_category) < 2 THEN
      RAISE EXCEPTION 'Please describe your category' USING ERRCODE = '22023';
    END IF;
  ELSE
    v_custom_category := NULL;
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
    custom_category,
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
    v_custom_category,
    true
  )
  RETURNING * INTO v_business;

  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (v_business.id, v_user_id, 'owner')
  ON CONFLICT (business_id, user_id) DO NOTHING;

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
EXCEPTION
  WHEN unique_violation THEN
    RAISE;
  WHEN foreign_key_violation THEN
    IF SQLERRM ILIKE '%category_id%' THEN
      RAISE EXCEPTION 'Please select a valid business category' USING ERRCODE = '22023';
    ELSIF SQLERRM ILIKE '%user_id%' THEN
      RAISE EXCEPTION 'You must be signed in to create a business' USING ERRCODE = '42501';
    ELSE
      RAISE EXCEPTION 'Unable to create the business. Please try again.' USING ERRCODE = '22023';
    END IF;
  WHEN not_null_violation OR check_violation THEN
    RAISE EXCEPTION '%', SQLERRM USING ERRCODE = '22023';
END;
$$;

REVOKE ALL ON FUNCTION public.complete_business_onboarding(
  TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_business_onboarding(
  TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

NOTIFY pgrst, 'reload schema';
