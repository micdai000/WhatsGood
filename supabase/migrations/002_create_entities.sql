-- Things users vote on: food, places, entertainment, movies/shows.
-- Tier is computed in the app from score (see getTier in mock.ts), not stored here.

CREATE TYPE public.entity_category AS ENUM (
  'food',
  'places',
  'entertainment',
  'movies_shows'
);

CREATE TABLE public.entities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  category        public.entity_category NOT NULL,
  image           TEXT,
  score           INTEGER NOT NULL DEFAULT 0,
  total_votes     INTEGER NOT NULL DEFAULT 0,
  followers_count INTEGER NOT NULL DEFAULT 0,
  location        TEXT,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entities are publicly readable"
  ON public.entities FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create entities"
  ON public.entities FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creators can update their entities"
  ON public.entities FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE TRIGGER on_entity_updated
  BEFORE UPDATE ON public.entities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
