-- Admin-seeded listings support the Other category with a typed label,
-- matching complete_business_onboarding (031).

DROP FUNCTION IF EXISTS public.admin_create_listing(
  TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
);

CREATE OR REPLACE FUNCTION public.admin_create_listing(
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
  p_custom_category TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_business public.businesses;
  v_location public.business_locations;
  v_qr public.business_qr_codes;
  v_category_slug TEXT;
  v_custom_category TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
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
  WHERE id = p_category_id;

  v_custom_category := NULLIF(trim(p_custom_category), '');

  IF v_category_slug = 'other' THEN
    IF v_custom_category IS NULL OR char_length(v_custom_category) < 2 THEN
      RAISE EXCEPTION 'Please describe the category' USING ERRCODE = '22023';
    END IF;
  ELSE
    v_custom_category := NULL;
  END IF;

  PERFORM set_config('meritt.trusted_write', 'on', true);

  INSERT INTO public.businesses (
    slug,
    name,
    description,
    logo_url,
    website_url,
    social_links,
    phone,
    email,
    category_id,
    custom_category,
    is_claimed,
    is_verified,
    listing_source
  )
  VALUES (
    trim(p_slug),
    trim(p_name),
    NULLIF(trim(p_description), ''),
    NULLIF(trim(p_logo_url), ''),
    NULLIF(trim(p_website_url), ''),
    CASE
      WHEN NULLIF(trim(p_website_url), '') IS NULL THEN '{}'::jsonb
      ELSE jsonb_build_object('website', trim(p_website_url))
    END,
    NULLIF(trim(p_phone), ''),
    NULLIF(trim(p_email), ''),
    p_category_id,
    v_custom_category,
    false,
    true,
    'admin'
  )
  RETURNING * INTO v_business;

  PERFORM set_config('meritt.trusted_write', 'off', true);

  -- on_business_created makes the creator an owner; admin listings stay unowned.
  DELETE FROM public.business_members WHERE business_id = v_business.id;

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
    upper(trim(p_state)),
    NULLIF(trim(p_postal_code), ''),
    COALESCE(NULLIF(trim(p_country), ''), 'US'),
    true
  )
  RETURNING * INTO v_location;

  INSERT INTO public.business_qr_codes (business_id, location_id, code, label)
  VALUES (
    v_business.id,
    v_location.id,
    COALESCE(NULLIF(trim(p_qr_code), ''), encode(extensions.gen_random_bytes(16), 'hex')),
    'Primary Business QR'
  )
  RETURNING * INTO v_qr;

  INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'business.listing_created',
    'business',
    v_business.id::TEXT,
    jsonb_build_object('name', v_business.name, 'slug', v_business.slug)
  );

  RETURN jsonb_build_object(
    'business', to_jsonb(v_business),
    'location', to_jsonb(v_location),
    'qr_code', to_jsonb(v_qr)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_create_listing(
  TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_create_listing(
  TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

SELECT pg_notify('pgrst', 'reload schema');
