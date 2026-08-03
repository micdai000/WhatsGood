-- Professional Links — external profile URLs stored as a flexible JSONB object.
-- Default {} keeps existing rows valid; app code normalizes missing keys to "".
-- Add future platforms (linkedin, youtube, etc.) as new JSON keys — no schema change.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.social_links IS
  'External professional profile links, e.g. {"instagram":"","facebook":"","x":"","website":""}. Extensible by key.';
