-- TrustLoop professions and profile onboarding fields
-- Required for onboarding wizard (profession step) and profile creation.

CREATE TABLE IF NOT EXISTS public.professions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  icon       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profession_id UUID REFERENCES public.professions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS city         TEXT,
  ADD COLUMN IF NOT EXISTS state        TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_profession_id ON public.profiles (profession_id);

ALTER TABLE public.professions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Professions are publicly readable" ON public.professions;
CREATE POLICY "Professions are publicly readable"
  ON public.professions FOR SELECT
  USING (true);

INSERT INTO public.professions (name, slug, icon) VALUES
  ('Car Detailing',       'car-detailing',     'car'),
  ('Photography',         'photography',       'camera'),
  ('Tutoring & Coaching', 'tutoring-coaching', 'graduation-cap'),
  ('Home Services',       'home-services',     'home'),
  ('Tech Services',       'tech-services',     'laptop')
ON CONFLICT (slug) DO NOTHING;
