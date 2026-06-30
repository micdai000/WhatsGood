-- TrustLoop professions and profile onboarding fields

CREATE TABLE public.professions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  icon       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN profession_id UUID REFERENCES public.professions(id) ON DELETE SET NULL,
  ADD COLUMN city         TEXT,
  ADD COLUMN state        TEXT;

CREATE INDEX idx_profiles_profession_id ON public.profiles (profession_id);

ALTER TABLE public.professions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professions are publicly readable"
  ON public.professions FOR SELECT
  USING (true);

INSERT INTO public.professions (name, slug, icon) VALUES
  ('Tutor',           'tutor',           'graduation-cap'),
  ('Therapist',       'therapist',       'heart-pulse'),
  ('Life Coach',      'life-coach',      'compass'),
  ('Consultant',      'consultant',      'briefcase'),
  ('Personal Trainer','personal-trainer','dumbbell'),
  ('Music Teacher',   'music-teacher',   'music'),
  ('Photographer',    'photographer',    'camera'),
  ('Accountant',      'accountant',      'calculator')
ON CONFLICT (slug) DO NOTHING;
