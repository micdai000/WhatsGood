-- Meritt business foundation (additive).
-- Introduces businesses, locations, membership, QR codes, and reputation
-- feedback/snapshots. Legacy professional tables are unchanged.

-- ===========================================================================
-- 1. business_categories
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.business_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  icon        TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================================
-- 2. businesses
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.businesses (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                        TEXT UNIQUE NOT NULL,
  name                        TEXT NOT NULL,
  description                 TEXT,
  logo_url                    TEXT,
  website_url                 TEXT,
  phone                       TEXT,
  email                       TEXT,
  category_id                 UUID REFERENCES public.business_categories(id) ON DELETE SET NULL,
  custom_category             TEXT,
  status                      TEXT NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'suspended', 'archived')),
  is_claimed                  BOOLEAN NOT NULL DEFAULT false,
  current_reputation_score    NUMERIC(6,3),
  current_reputation_tier     TEXT NOT NULL DEFAULT 'building'
                                CHECK (current_reputation_tier IN ('building', 'bronze', 'silver', 'gold', 'elite')),
  current_reputation_period   TEXT,
  total_feedback              INTEGER NOT NULL DEFAULT 0,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================================
-- 3. business_locations
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.business_locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name            TEXT,
  address_line_1  TEXT,
  address_line_2  TEXT,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  postal_code     TEXT,
  country         TEXT NOT NULL DEFAULT 'US',
  phone           TEXT,
  is_primary      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================================
-- 4. business_members
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.business_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'owner'
                CHECK (role IN ('owner', 'admin', 'member')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT business_members_business_user_unique UNIQUE (business_id, user_id)
);

-- ===========================================================================
-- 5. business_qr_codes
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.business_qr_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.business_locations(id) ON DELETE CASCADE,
  code        TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  label       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  scan_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================================
-- 6. reputation_feedback
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.reputation_feedback (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id           UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  location_id           UUID REFERENCES public.business_locations(id) ON DELETE SET NULL,
  submitted_by_user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  qr_code_id            UUID REFERENCES public.business_qr_codes(id) ON DELETE SET NULL,
  would_recommend       BOOLEAN,
  experience_type       TEXT,
  feedback_data         JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified              BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================================
-- 7. reputation_snapshots
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.reputation_snapshots (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id             UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  location_id             UUID REFERENCES public.business_locations(id) ON DELETE CASCADE,
  period                  TEXT NOT NULL,
  reputation_score        NUMERIC(6,3),
  reputation_tier         TEXT NOT NULL DEFAULT 'building'
                            CHECK (reputation_tier IN ('building', 'bronze', 'silver', 'gold', 'elite')),
  feedback_count          INTEGER NOT NULL DEFAULT 0,
  verified_feedback_count INTEGER NOT NULL DEFAULT 0,
  eligible                BOOLEAN NOT NULL DEFAULT false,
  component_breakdown     JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================================
-- Indexes
-- ===========================================================================

CREATE INDEX IF NOT EXISTS idx_businesses_slug
  ON public.businesses (slug);
CREATE INDEX IF NOT EXISTS idx_businesses_category_id
  ON public.businesses (category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status
  ON public.businesses (status);

CREATE INDEX IF NOT EXISTS idx_business_locations_business_id
  ON public.business_locations (business_id);
CREATE INDEX IF NOT EXISTS idx_business_locations_city
  ON public.business_locations (city);
CREATE INDEX IF NOT EXISTS idx_business_locations_state
  ON public.business_locations (state);
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_locations_one_primary
  ON public.business_locations (business_id)
  WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_business_members_business_id
  ON public.business_members (business_id);
CREATE INDEX IF NOT EXISTS idx_business_members_user_id
  ON public.business_members (user_id);

CREATE INDEX IF NOT EXISTS idx_business_qr_codes_code
  ON public.business_qr_codes (code);
CREATE INDEX IF NOT EXISTS idx_business_qr_codes_business_id
  ON public.business_qr_codes (business_id);
CREATE INDEX IF NOT EXISTS idx_business_qr_codes_location_id
  ON public.business_qr_codes (location_id);

CREATE INDEX IF NOT EXISTS idx_reputation_feedback_business_id
  ON public.reputation_feedback (business_id);
CREATE INDEX IF NOT EXISTS idx_reputation_feedback_location_id
  ON public.reputation_feedback (location_id);
CREATE INDEX IF NOT EXISTS idx_reputation_feedback_created_at
  ON public.reputation_feedback (created_at);

CREATE INDEX IF NOT EXISTS idx_reputation_snapshots_business_id
  ON public.reputation_snapshots (business_id);
CREATE INDEX IF NOT EXISTS idx_reputation_snapshots_period
  ON public.reputation_snapshots (period);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reputation_snapshots_unique_period
  ON public.reputation_snapshots (
    business_id,
    COALESCE(location_id, '00000000-0000-0000-0000-000000000000'::uuid),
    period
  );

-- ===========================================================================
-- Helper functions (after business_members exists)
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.is_business_member(_business_id UUID)
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
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.has_business_role(_business_id UUID, _roles TEXT[])
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
      AND user_id = auth.uid()
      AND role = ANY (_roles)
  );
$$;

REVOKE ALL ON FUNCTION public.is_business_member(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_business_role(UUID, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_business_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_business_role(UUID, TEXT[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_business_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.business_members (business_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'owner');
  END IF;
  RETURN NEW;
END;
$$;

-- ===========================================================================
-- updated_at + owner-bootstrap triggers
-- ===========================================================================

DROP TRIGGER IF EXISTS on_business_category_updated ON public.business_categories;
CREATE TRIGGER on_business_category_updated
  BEFORE UPDATE ON public.business_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_business_updated ON public.businesses;
CREATE TRIGGER on_business_updated
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_business_created ON public.businesses;
CREATE TRIGGER on_business_created
  AFTER INSERT ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_business_created();

DROP TRIGGER IF EXISTS on_business_location_updated ON public.business_locations;
CREATE TRIGGER on_business_location_updated
  BEFORE UPDATE ON public.business_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_business_qr_code_updated ON public.business_qr_codes;
CREATE TRIGGER on_business_qr_code_updated
  BEFORE UPDATE ON public.business_qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================================================
-- RLS
-- ===========================================================================

ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_snapshots ENABLE ROW LEVEL SECURITY;

-- business_categories
DROP POLICY IF EXISTS "Active categories are publicly readable" ON public.business_categories;
CREATE POLICY "Active categories are publicly readable"
  ON public.business_categories FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can insert categories" ON public.business_categories;
CREATE POLICY "Admins can insert categories"
  ON public.business_categories FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.business_categories;
CREATE POLICY "Admins can update categories"
  ON public.business_categories FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- businesses
DROP POLICY IF EXISTS "Active businesses are publicly readable" ON public.businesses;
CREATE POLICY "Active businesses are publicly readable"
  ON public.businesses FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Business members can view their businesses" ON public.businesses;
CREATE POLICY "Business members can view their businesses"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (public.is_business_member(id));

DROP POLICY IF EXISTS "Authenticated users can create businesses" ON public.businesses;
CREATE POLICY "Authenticated users can create businesses"
  ON public.businesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Business managers can update their businesses" ON public.businesses;
CREATE POLICY "Business managers can update their businesses"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (public.has_business_role(id, ARRAY['owner', 'admin']))
  WITH CHECK (public.has_business_role(id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Admins can update any business" ON public.businesses;
CREATE POLICY "Admins can update any business"
  ON public.businesses FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- business_locations
DROP POLICY IF EXISTS "Locations of active businesses are publicly readable" ON public.business_locations;
CREATE POLICY "Locations of active businesses are publicly readable"
  ON public.business_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_locations.business_id
        AND b.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Business members can view their locations" ON public.business_locations;
CREATE POLICY "Business members can view their locations"
  ON public.business_locations FOR SELECT
  TO authenticated
  USING (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Business members can create locations" ON public.business_locations;
CREATE POLICY "Business members can create locations"
  ON public.business_locations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Business members can update locations" ON public.business_locations;
CREATE POLICY "Business members can update locations"
  ON public.business_locations FOR UPDATE
  TO authenticated
  USING (public.is_business_member(business_id))
  WITH CHECK (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Business members can delete locations" ON public.business_locations;
CREATE POLICY "Business members can delete locations"
  ON public.business_locations FOR DELETE
  TO authenticated
  USING (public.is_business_member(business_id));

-- business_members
DROP POLICY IF EXISTS "Business members can view members" ON public.business_members;
CREATE POLICY "Business members can view members"
  ON public.business_members FOR SELECT
  TO authenticated
  USING (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Owners can add members" ON public.business_members;
CREATE POLICY "Owners can add members"
  ON public.business_members FOR INSERT
  TO authenticated
  WITH CHECK (public.has_business_role(business_id, ARRAY['owner']));

DROP POLICY IF EXISTS "Owners can update members" ON public.business_members;
CREATE POLICY "Owners can update members"
  ON public.business_members FOR UPDATE
  TO authenticated
  USING (public.has_business_role(business_id, ARRAY['owner']))
  WITH CHECK (public.has_business_role(business_id, ARRAY['owner']));

DROP POLICY IF EXISTS "Owners or self can remove members" ON public.business_members;
CREATE POLICY "Owners or self can remove members"
  ON public.business_members FOR DELETE
  TO authenticated
  USING (
    public.has_business_role(business_id, ARRAY['owner'])
    OR user_id = auth.uid()
  );

-- business_qr_codes
DROP POLICY IF EXISTS "Active QR codes are publicly readable" ON public.business_qr_codes;
CREATE POLICY "Active QR codes are publicly readable"
  ON public.business_qr_codes FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_qr_codes.business_id
        AND b.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Business members can view their QR codes" ON public.business_qr_codes;
CREATE POLICY "Business members can view their QR codes"
  ON public.business_qr_codes FOR SELECT
  TO authenticated
  USING (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Business members can create QR codes" ON public.business_qr_codes;
CREATE POLICY "Business members can create QR codes"
  ON public.business_qr_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_business_member(business_id)
    AND (
      location_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.business_locations l
        WHERE l.id = location_id
          AND l.business_id = business_qr_codes.business_id
      )
    )
  );

DROP POLICY IF EXISTS "Business members can update QR codes" ON public.business_qr_codes;
CREATE POLICY "Business members can update QR codes"
  ON public.business_qr_codes FOR UPDATE
  TO authenticated
  USING (public.is_business_member(business_id))
  WITH CHECK (
    public.is_business_member(business_id)
    AND (
      location_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.business_locations l
        WHERE l.id = location_id
          AND l.business_id = business_qr_codes.business_id
      )
    )
  );

DROP POLICY IF EXISTS "Business members can delete QR codes" ON public.business_qr_codes;
CREATE POLICY "Business members can delete QR codes"
  ON public.business_qr_codes FOR DELETE
  TO authenticated
  USING (public.is_business_member(business_id));

-- reputation_feedback
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.reputation_feedback;
CREATE POLICY "Anyone can submit feedback"
  ON public.reputation_feedback FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Business members can view their feedback" ON public.reputation_feedback;
CREATE POLICY "Business members can view their feedback"
  ON public.reputation_feedback FOR SELECT
  TO authenticated
  USING (public.is_business_member(business_id));

DROP POLICY IF EXISTS "Feedback submitters can view their own feedback" ON public.reputation_feedback;
CREATE POLICY "Feedback submitters can view their own feedback"
  ON public.reputation_feedback FOR SELECT
  TO authenticated
  USING (submitted_by_user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can delete feedback" ON public.reputation_feedback;
CREATE POLICY "Admins can delete feedback"
  ON public.reputation_feedback FOR DELETE
  USING (public.is_admin());

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
BEGIN
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

REVOKE ALL ON FUNCTION public.submit_reputation_feedback(UUID, UUID, UUID, BOOLEAN, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_reputation_feedback(UUID, UUID, UUID, BOOLEAN, TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_reputation_feedback(UUID, UUID, UUID, BOOLEAN, TEXT, JSONB) TO authenticated;

-- reputation_snapshots
DROP POLICY IF EXISTS "Reputation snapshots are publicly readable" ON public.reputation_snapshots;
CREATE POLICY "Reputation snapshots are publicly readable"
  ON public.reputation_snapshots FOR SELECT
  USING (true);

-- ===========================================================================
-- Seed broad industry categories (not professions)
-- ===========================================================================

INSERT INTO public.business_categories (name, slug, description, icon) VALUES
  ('Automotive',                  'automotive',                  'Auto repair, detailing, and vehicle services',           'car'),
  ('Barber',                      'barber',                      'Barbershops and men''s grooming',                        'scissors'),
  ('Beauty & Personal Care',      'beauty-personal-care',        'Salons, barbers, spas, and personal care',               'sparkles'),
  ('Construction & Home Services','construction-home-services',  'Contractors, trades, and home services',                 'hammer'),
  ('Education & Coaching',        'education-coaching',          'Tutors, coaches, and education services',                'graduation-cap'),
  ('Food & Dining',               'food-dining',                 'Restaurants, cafes, and food businesses',                'utensils'),
  ('Health & Wellness',           'health-wellness',             'Gyms, clinics, and wellness providers',                  'heart'),
  ('Hotel',                       'hotel',                       'Hotels, motels, and lodging',                            'bed'),
  ('Photography & Creative',      'photography-creative',        'Photographers and creative studios',                     'camera'),
  ('Professional Services',       'professional-services',       'Legal, accounting, consulting, and other professionals', 'briefcase'),
  ('Retail',                      'retail',                      'Stores and retail shops',                                'shopping-bag'),
  ('Technology',                  'technology',                  'Tech services, IT, and software businesses',             'laptop'),
  ('Other',                       'other',                       'Businesses that do not fit another category',            'ellipsis')
ON CONFLICT (slug) DO NOTHING;
