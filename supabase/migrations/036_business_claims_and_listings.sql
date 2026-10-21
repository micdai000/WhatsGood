-- Admin-seeded listings and verified ownership claims.
--
-- * Admins can create public listings that stay unclaimed (no owner membership).
-- * Owners claim a listing by proving control of a contact channel already on
--   the public record (listed phone / email), or by website / document proof
--   reviewed by an admin.
-- * Verification codes live in a table no client role can read.
-- * Protected business columns (verification, claim state, suspension) can
--   only change through admins or the claim RPCs.

-- ===========================================================================
-- 0. Platform owner
-- ===========================================================================

INSERT INTO public.admin_users (user_id, role)
SELECT id, 'owner'
FROM auth.users
WHERE lower(email) = 'silas.jeppsonc21@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'owner';

-- ===========================================================================
-- 1. businesses: verification + claim bookkeeping
-- ===========================================================================

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS listing_source TEXT NOT NULL DEFAULT 'owner',
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contact_locked_until TIMESTAMPTZ;

ALTER TABLE public.businesses
  DROP CONSTRAINT IF EXISTS businesses_listing_source_check;
ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_listing_source_check
  CHECK (listing_source IN ('owner', 'admin'));

UPDATE public.businesses
SET claimed_at = created_at
WHERE is_claimed = true
  AND claimed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_businesses_is_verified
  ON public.businesses (is_verified);
CREATE INDEX IF NOT EXISTS idx_businesses_is_claimed
  ON public.businesses (is_claimed);

DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;
CREATE POLICY "Admins can view all businesses"
  ON public.businesses FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all locations" ON public.business_locations;
CREATE POLICY "Admins can view all locations"
  ON public.business_locations FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update locations" ON public.business_locations;
CREATE POLICY "Admins can update locations"
  ON public.business_locations FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Trusted RPCs set meritt.trusted_write = 'on' for the duration of their
-- transaction so the guard below lets claim-state changes through.
CREATE OR REPLACE FUNCTION public.guard_business_protected_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(current_setting('meritt.trusted_write', true), '') = 'on'
     OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin() THEN
      NEW.is_verified := false;
      NEW.listing_source := 'owner';
      NEW.contact_locked_until := NULL;
      NEW.claimed_at := CASE WHEN NEW.is_claimed THEN now() ELSE NULL END;
    END IF;
    RETURN NEW;
  END IF;

  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  NEW.is_verified := OLD.is_verified;
  NEW.is_claimed := OLD.is_claimed;
  NEW.claimed_at := OLD.claimed_at;
  NEW.listing_source := OLD.listing_source;
  NEW.contact_locked_until := OLD.contact_locked_until;

  IF OLD.status = 'suspended' OR NEW.status = 'suspended' THEN
    NEW.status := OLD.status;
  END IF;

  IF OLD.contact_locked_until IS NOT NULL
     AND OLD.contact_locked_until > now()
     AND (
       NEW.phone IS DISTINCT FROM OLD.phone
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.website_url IS DISTINCT FROM OLD.website_url
     ) THEN
    RAISE EXCEPTION 'Phone, email, and website are locked until % after a recent ownership claim. Contact Meritt support to change them sooner.',
      to_char(OLD.contact_locked_until AT TIME ZONE 'UTC', 'Mon DD, YYYY')
      USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_business_protected_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_business_protected_fields ON public.businesses;
CREATE TRIGGER guard_business_protected_fields
  BEFORE INSERT OR UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_business_protected_fields();

-- ===========================================================================
-- 2. business_claim_requests: claimant details + review fields
-- ===========================================================================

ALTER TABLE public.business_claim_requests
  ADD COLUMN IF NOT EXISTS claimant_name TEXT,
  ADD COLUMN IF NOT EXISTS claimant_role TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS verification_method TEXT NOT NULL DEFAULT 'phone',
  ADD COLUMN IF NOT EXISTS evidence_url TEXT,
  ADD COLUMN IF NOT EXISTS claimant_note TEXT,
  ADD COLUMN IF NOT EXISTS code_issued_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE public.business_claim_requests
  DROP CONSTRAINT IF EXISTS business_claim_requests_method_check;
ALTER TABLE public.business_claim_requests
  ADD CONSTRAINT business_claim_requests_method_check
  CHECK (verification_method IN ('phone', 'email', 'website', 'document'));

ALTER TABLE public.business_claim_requests
  DROP CONSTRAINT IF EXISTS business_claim_requests_role_check;
ALTER TABLE public.business_claim_requests
  ADD CONSTRAINT business_claim_requests_role_check
  CHECK (claimant_role IS NULL OR claimant_role IN ('owner', 'co_owner', 'manager'));

-- All writes go through the RPCs below.
DROP POLICY IF EXISTS "Users can request to claim unclaimed businesses" ON public.business_claim_requests;
DROP POLICY IF EXISTS "Users can cancel their pending claim requests" ON public.business_claim_requests;
DROP POLICY IF EXISTS "Admins can update claim requests" ON public.business_claim_requests;
REVOKE INSERT, UPDATE, DELETE ON public.business_claim_requests FROM anon, authenticated;

-- ===========================================================================
-- 3. business_claim_codes (no client access)
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.business_claim_codes (
  claim_id      UUID PRIMARY KEY REFERENCES public.business_claim_requests(id) ON DELETE CASCADE,
  code_hash     TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  issued_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_claim_codes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.business_claim_codes FROM anon, authenticated;

-- ===========================================================================
-- 4. Internal approval (not callable by clients)
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.approve_business_claim_internal(
  p_claim_id UUID,
  p_reviewer UUID,
  p_via TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS public.business_claim_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claim public.business_claim_requests;
  v_business public.businesses;
BEGIN
  SELECT * INTO v_claim
  FROM public.business_claim_requests
  WHERE id = p_claim_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Claim request not found' USING ERRCODE = '22023';
  END IF;

  IF v_claim.status <> 'pending' THEN
    RAISE EXCEPTION 'This claim request is no longer pending' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_business
  FROM public.businesses
  WHERE id = v_claim.business_id
  FOR UPDATE;

  IF v_business.is_claimed THEN
    RAISE EXCEPTION 'This business has already been claimed' USING ERRCODE = '23505';
  END IF;

  PERFORM set_config('meritt.trusted_write', 'on', true);

  UPDATE public.businesses
  SET is_claimed = true,
      is_verified = true,
      claimed_at = now(),
      contact_locked_until = now() + interval '14 days'
  WHERE id = v_business.id;

  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (v_business.id, v_claim.user_id, 'owner')
  ON CONFLICT (business_id, user_id) DO UPDATE SET role = 'owner';

  PERFORM set_config('meritt.trusted_write', 'off', true);

  UPDATE public.business_claim_requests
  SET status = 'approved',
      reviewed_by = p_reviewer,
      reviewed_at = now(),
      review_notes = COALESCE(NULLIF(trim(p_notes), ''), review_notes)
  WHERE id = p_claim_id
  RETURNING * INTO v_claim;

  UPDATE public.business_claim_requests
  SET status = 'rejected',
      reviewed_by = p_reviewer,
      reviewed_at = now(),
      review_notes = 'Another ownership claim for this business was approved.'
  WHERE business_id = v_business.id
    AND status = 'pending'
    AND id <> p_claim_id;

  DELETE FROM public.business_claim_codes
  WHERE claim_id IN (
    SELECT id FROM public.business_claim_requests WHERE business_id = v_business.id
  );

  INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_reviewer,
    'business.claim_approved',
    'business',
    v_business.id::TEXT,
    jsonb_build_object(
      'claimId', p_claim_id,
      'userId', v_claim.user_id,
      'via', p_via
    )
  );

  RETURN v_claim;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_business_claim_internal(UUID, UUID, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;

-- ===========================================================================
-- 5. Claimant RPCs
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.request_business_claim(
  p_business_id UUID,
  p_claimant_name TEXT,
  p_claimant_role TEXT,
  p_contact_phone TEXT DEFAULT NULL,
  p_contact_email TEXT DEFAULT NULL,
  p_verification_method TEXT DEFAULT 'phone',
  p_evidence_url TEXT DEFAULT NULL,
  p_note TEXT DEFAULT NULL
)
RETURNS public.business_claim_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_business public.businesses;
  v_pending_count INTEGER;
  v_recent_count INTEGER;
  v_claim public.business_claim_requests;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to claim a business' USING ERRCODE = '42501';
  END IF;

  IF p_claimant_name IS NULL OR length(trim(p_claimant_name)) < 2 THEN
    RAISE EXCEPTION 'Enter your full name' USING ERRCODE = '22023';
  END IF;

  IF p_claimant_role IS NULL OR p_claimant_role NOT IN ('owner', 'co_owner', 'manager') THEN
    RAISE EXCEPTION 'Select your role at the business' USING ERRCODE = '22023';
  END IF;

  IF p_verification_method IS NULL
     OR p_verification_method NOT IN ('phone', 'email', 'website', 'document') THEN
    RAISE EXCEPTION 'Select a verification method' USING ERRCODE = '22023';
  END IF;

  IF NULLIF(trim(p_contact_phone), '') IS NULL AND NULLIF(trim(p_contact_email), '') IS NULL THEN
    RAISE EXCEPTION 'Add a phone number or email so we can reach you' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_business FROM public.businesses WHERE id = p_business_id;

  IF NOT FOUND OR v_business.status <> 'active' THEN
    RAISE EXCEPTION 'Business not found' USING ERRCODE = '22023';
  END IF;

  IF v_business.is_claimed THEN
    RAISE EXCEPTION 'This business has already been claimed' USING ERRCODE = '23505';
  END IF;

  IF p_verification_method = 'phone' AND NULLIF(trim(v_business.phone), '') IS NULL THEN
    RAISE EXCEPTION 'This listing has no phone number on file. Choose another verification method.'
      USING ERRCODE = '22023';
  END IF;

  IF p_verification_method = 'email' AND NULLIF(trim(v_business.email), '') IS NULL
     AND NULLIF(trim(v_business.website_url), '') IS NULL THEN
    RAISE EXCEPTION 'This listing has no email or website on file. Choose another verification method.'
      USING ERRCODE = '22023';
  END IF;

  SELECT COUNT(*) INTO v_pending_count
  FROM public.business_claim_requests
  WHERE user_id = v_user AND status = 'pending';

  IF v_pending_count >= 3 THEN
    RAISE EXCEPTION 'You already have 3 pending claims. Wait for those to be reviewed first.'
      USING ERRCODE = '22023';
  END IF;

  SELECT COUNT(*) INTO v_recent_count
  FROM public.business_claim_requests
  WHERE user_id = v_user AND created_at > now() - interval '1 day';

  IF v_recent_count >= 5 THEN
    RAISE EXCEPTION 'Too many claim requests today. Try again tomorrow.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.business_claim_requests (
    business_id,
    user_id,
    status,
    claimant_name,
    claimant_role,
    contact_phone,
    contact_email,
    verification_method,
    evidence_url,
    claimant_note
  )
  VALUES (
    p_business_id,
    v_user,
    'pending',
    trim(p_claimant_name),
    p_claimant_role,
    NULLIF(trim(p_contact_phone), ''),
    NULLIF(trim(p_contact_email), ''),
    p_verification_method,
    NULLIF(trim(p_evidence_url), ''),
    NULLIF(trim(p_note), '')
  )
  RETURNING * INTO v_claim;

  RETURN v_claim;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_business_claim(p_claim_id UUID)
RETURNS public.business_claim_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claim public.business_claim_requests;
BEGIN
  UPDATE public.business_claim_requests
  SET status = 'cancelled'
  WHERE id = p_claim_id
    AND user_id = auth.uid()
    AND status = 'pending'
  RETURNING * INTO v_claim;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending claim request not found' USING ERRCODE = '22023';
  END IF;

  DELETE FROM public.business_claim_codes WHERE claim_id = p_claim_id;

  RETURN v_claim;
END;
$$;

-- Returns jsonb instead of raising on a wrong code so the attempt counter
-- increment is committed.
CREATE OR REPLACE FUNCTION public.verify_business_claim_code(
  p_claim_id UUID,
  p_code TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_claim public.business_claim_requests;
  v_code public.business_claim_codes;
  v_max_attempts CONSTANT INTEGER := 5;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'You must be signed in' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_claim
  FROM public.business_claim_requests
  WHERE id = p_claim_id AND user_id = v_user
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Claim request not found');
  END IF;

  IF v_claim.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'This claim request is no longer pending');
  END IF;

  SELECT * INTO v_code
  FROM public.business_claim_codes
  WHERE claim_id = p_claim_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'No verification code has been issued for this claim yet'
    );
  END IF;

  IF v_code.expires_at < now() THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'This code has expired. Reply to Meritt to get a new one.'
    );
  END IF;

  IF v_code.attempt_count >= v_max_attempts THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Too many incorrect attempts. Reply to Meritt to get a new code.',
      'attemptsRemaining', 0
    );
  END IF;

  IF p_code IS NULL
     OR extensions.crypt(regexp_replace(p_code, '\s', '', 'g'), v_code.code_hash) <> v_code.code_hash THEN
    UPDATE public.business_claim_codes
    SET attempt_count = attempt_count + 1
    WHERE claim_id = p_claim_id;

    RETURN jsonb_build_object(
      'ok', false,
      'error', 'That code is incorrect',
      'attemptsRemaining', GREATEST(v_max_attempts - v_code.attempt_count - 1, 0)
    );
  END IF;

  v_claim := public.approve_business_claim_internal(
    p_claim_id,
    v_code.issued_by,
    'code:' || v_claim.verification_method,
    NULL
  );

  RETURN jsonb_build_object('ok', true, 'claim', to_jsonb(v_claim));
END;
$$;

-- ===========================================================================
-- 6. Admin RPCs
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.admin_issue_claim_code(p_claim_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_claim public.business_claim_requests;
  v_code TEXT;
  v_expires TIMESTAMPTZ := now() + interval '24 hours';
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_claim
  FROM public.business_claim_requests
  WHERE id = p_claim_id
  FOR UPDATE;

  IF NOT FOUND OR v_claim.status <> 'pending' THEN
    RAISE EXCEPTION 'Pending claim request not found' USING ERRCODE = '22023';
  END IF;

  v_code := lpad(
    (abs(('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint) % 1000000)::TEXT,
    6,
    '0'
  );

  INSERT INTO public.business_claim_codes (claim_id, code_hash, expires_at, attempt_count, issued_by)
  VALUES (p_claim_id, extensions.crypt(v_code, extensions.gen_salt('bf')), v_expires, 0, auth.uid())
  ON CONFLICT (claim_id) DO UPDATE
  SET code_hash = EXCLUDED.code_hash,
      expires_at = EXCLUDED.expires_at,
      attempt_count = 0,
      issued_by = EXCLUDED.issued_by,
      created_at = now();

  UPDATE public.business_claim_requests
  SET code_issued_at = now(),
      code_expires_at = v_expires
  WHERE id = p_claim_id;

  INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'business.claim_code_issued',
    'business_claim',
    p_claim_id::TEXT,
    jsonb_build_object('businessId', v_claim.business_id, 'method', v_claim.verification_method)
  );

  RETURN v_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_approve_business_claim(
  p_claim_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS public.business_claim_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;

  RETURN public.approve_business_claim_internal(p_claim_id, auth.uid(), 'admin_review', p_notes);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_business_claim(
  p_claim_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS public.business_claim_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claim public.business_claim_requests;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;

  UPDATE public.business_claim_requests
  SET status = 'rejected',
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      review_notes = NULLIF(trim(p_notes), '')
  WHERE id = p_claim_id
    AND status = 'pending'
  RETURNING * INTO v_claim;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending claim request not found' USING ERRCODE = '22023';
  END IF;

  DELETE FROM public.business_claim_codes WHERE claim_id = p_claim_id;

  INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'business.claim_rejected',
    'business_claim',
    p_claim_id::TEXT,
    jsonb_build_object('businessId', v_claim.business_id, 'userId', v_claim.user_id)
  );

  RETURN v_claim;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_business_claims(p_status TEXT DEFAULT 'pending')
RETURNS TABLE (
  claim jsonb,
  claimant_email TEXT,
  business jsonb,
  city TEXT,
  state TEXT,
  code_attempts INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    to_jsonb(c),
    u.email::TEXT,
    to_jsonb(b),
    l.city,
    l.state,
    codes.attempt_count
  FROM public.business_claim_requests c
  JOIN public.businesses b ON b.id = c.business_id
  LEFT JOIN auth.users u ON u.id = c.user_id
  LEFT JOIN LATERAL (
    SELECT bl.city, bl.state
    FROM public.business_locations bl
    WHERE bl.business_id = b.id
    ORDER BY bl.is_primary DESC, bl.created_at ASC
    LIMIT 1
  ) l ON true
  LEFT JOIN public.business_claim_codes codes ON codes.claim_id = c.id
  WHERE p_status IS NULL OR p_status = '' OR c.status = p_status
  ORDER BY c.created_at DESC
  LIMIT 200;
END;
$$;

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
  p_qr_code TEXT DEFAULT NULL
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

-- ===========================================================================
-- 7. Grants
-- ===========================================================================

REVOKE ALL ON FUNCTION public.request_business_claim(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_business_claim(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_business_claim_code(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_issue_claim_code(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_approve_business_claim(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_reject_business_claim(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_business_claims(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_create_listing(
  TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.request_business_claim(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_business_claim(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_business_claim_code(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_issue_claim_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_approve_business_claim(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_business_claim(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_business_claims(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_listing(
  TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

SELECT pg_notify('pgrst', 'reload schema');
