-- Public profiles extending auth.users.
-- The id column mirrors auth.users.id (1:1 relationship).
-- average_rating and total_reviews are denormalized for fast reads —
-- they get updated via a trigger whenever a review is inserted.

CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  slug            TEXT UNIQUE NOT NULL,
  full_name       TEXT NOT NULL,
  profession_id   UUID REFERENCES public.professions(id) ON DELETE SET NULL,
  bio             TEXT,
  city            TEXT,
  state           TEXT,
  profile_photo   TEXT,
  average_rating  NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  total_reviews   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view public profiles (search, profile pages)
CREATE POLICY "Profiles are publicly readable"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Only the profile owner can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- A user can insert their own profile row (during onboarding)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-update the updated_at timestamp on every change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
