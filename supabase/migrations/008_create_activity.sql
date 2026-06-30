-- Activity feed events (votes, tier changes, library creation, follows).

CREATE TYPE public.activity_type AS ENUM (
  'promote',
  'demote',
  'maintain',
  'create_library',
  'tier_up',
  'tier_down',
  'follow'
);

CREATE TABLE public.activity (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          public.activity_type NOT NULL,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_id     UUID REFERENCES public.entities(id) ON DELETE SET NULL,
  library_id    UUID REFERENCES public.libraries(id) ON DELETE SET NULL,
  tier          TEXT,
  previous_tier TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity feed is publicly readable"
  ON public.activity FOR SELECT
  USING (true);

-- Activity rows are inserted by server-side logic (API routes), not directly by clients.
