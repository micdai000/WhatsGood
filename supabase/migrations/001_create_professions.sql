-- Profession lookup table
-- Normalized so new professions can be added without touching profiles.
-- Slugs enable SEO-friendly URLs like /profession/electrician.

CREATE TABLE public.professions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  icon       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.professions ENABLE ROW LEVEL SECURITY;

-- Everyone can read professions (dropdown menus, search filters, public pages)
CREATE POLICY "Professions are publicly readable"
  ON public.professions
  FOR SELECT
  USING (true);
