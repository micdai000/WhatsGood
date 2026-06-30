-- User profiles extending auth.users (1:1).
-- Mirrors the User type in src/data/mock.ts.

CREATE TABLE public.profiles (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username                TEXT UNIQUE NOT NULL,
  display_name            TEXT NOT NULL,
  avatar                  TEXT,
  bio                     TEXT,
  followers_count         INTEGER NOT NULL DEFAULT 0,
  following_count         INTEGER NOT NULL DEFAULT 0,
  total_votes_cast        INTEGER NOT NULL DEFAULT 0,
  entities_followed_count INTEGER NOT NULL DEFAULT 0,
  libraries_created_count INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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
