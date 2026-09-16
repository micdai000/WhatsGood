-- Public QR resolution (distinct inactive / unavailable / not found)
-- and server-side guards for feedback submission.

CREATE OR REPLACE FUNCTION public.resolve_public_qr(p_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_qr public.business_qr_codes;
  v_business public.businesses;
BEGIN
  IF p_code IS NULL OR length(trim(p_code)) < 1 THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  SELECT * INTO v_qr
  FROM public.business_qr_codes
  WHERE code = trim(p_code);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  IF v_qr.is_active IS NOT TRUE THEN
    RETURN jsonb_build_object('status', 'inactive');
  END IF;

  SELECT * INTO v_business
  FROM public.businesses
  WHERE id = v_qr.business_id;

  IF NOT FOUND OR v_business.status <> 'active' THEN
    RETURN jsonb_build_object('status', 'unavailable');
  END IF;

  RETURN jsonb_build_object(
    'status', 'ok',
    'slug', v_business.slug,
    'qr', jsonb_build_object(
      'id', v_qr.id,
      'business_id', v_qr.business_id,
      'location_id', v_qr.location_id,
      'code', v_qr.code,
      'is_active', v_qr.is_active
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_public_qr(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_public_qr(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.resolve_public_qr(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_reputation_feedback(
  p_business_id UUID,
  p_location_id UUID DEFAULT NULL,
  p_qr_code_id UUID DEFAULT NULL,
  p_would_recommend BOOLEAN DEFAULT NULL,
  p_experience_type TEXT DEFAULT NULL,
  p_feedback_data JSONB DEFAULT '{}'::jsonb
)
RETURNS public.reputation_feedback
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.reputation_feedback;
  v_status TEXT;
  v_qr public.business_qr_codes;
  v_location public.business_locations;
BEGIN
  IF p_business_id IS NULL THEN
    RAISE EXCEPTION 'Business is required' USING ERRCODE = '22023';
  END IF;

  SELECT status INTO v_status
  FROM public.businesses
  WHERE id = p_business_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found' USING ERRCODE = '22023';
  END IF;

  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'This business is not accepting feedback' USING ERRCODE = '22023';
  END IF;

  IF p_qr_code_id IS NOT NULL THEN
    SELECT * INTO v_qr
    FROM public.business_qr_codes
    WHERE id = p_qr_code_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'QR code not found' USING ERRCODE = '22023';
    END IF;

    IF v_qr.is_active IS NOT TRUE THEN
      RAISE EXCEPTION 'This QR code is inactive' USING ERRCODE = '22023';
    END IF;

    IF v_qr.business_id <> p_business_id THEN
      RAISE EXCEPTION 'QR code does not belong to this business' USING ERRCODE = '22023';
    END IF;

    IF COALESCE(v_qr.location_id, '00000000-0000-0000-0000-000000000000'::uuid)
       IS DISTINCT FROM COALESCE(p_location_id, '00000000-0000-0000-0000-000000000000'::uuid) THEN
      RAISE EXCEPTION 'Location does not match this QR code' USING ERRCODE = '22023';
    END IF;
  ELSIF p_location_id IS NOT NULL THEN
    SELECT * INTO v_location
    FROM public.business_locations
    WHERE id = p_location_id;

    IF NOT FOUND OR v_location.business_id <> p_business_id THEN
      RAISE EXCEPTION 'Location does not belong to this business' USING ERRCODE = '22023';
    END IF;
  END IF;

  INSERT INTO public.reputation_feedback (
    business_id,
    location_id,
    submitted_by_user_id,
    qr_code_id,
    would_recommend,
    experience_type,
    feedback_data
  )
  VALUES (
    p_business_id,
    p_location_id,
    auth.uid(),
    p_qr_code_id,
    p_would_recommend,
    p_experience_type,
    COALESCE(p_feedback_data, '{}'::jsonb)
  )
  RETURNING * INTO result;

  RETURN result;
END;
$$;

SELECT pg_notify('pgrst', 'reload schema');
