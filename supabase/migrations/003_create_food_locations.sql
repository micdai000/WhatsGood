-- Physical locations for food entities (e.g. Chick-fil-A at different addresses).
-- Each location has its own score and vote count.

CREATE TABLE public.food_locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id   UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  restaurant  TEXT NOT NULL,
  address     TEXT NOT NULL,
  city        TEXT NOT NULL,
  location    TEXT NOT NULL,
  score       INTEGER NOT NULL DEFAULT 0,
  total_votes INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.food_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Food locations are publicly readable"
  ON public.food_locations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add food locations"
  ON public.food_locations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE TRIGGER on_food_location_updated
  BEFORE UPDATE ON public.food_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
