-- Business professional links (Instagram, Facebook, X, website).
-- Mirrors profiles.social_links so the same form helpers can be reused.
-- website_url remains for existing callers; app syncs it from social_links.website.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.businesses.social_links IS
  'External business links, e.g. {"instagram":"","facebook":"","x":"","website":""}. Extensible by key.';

-- Seed website into social_links when only website_url is set today.
UPDATE public.businesses
SET social_links = jsonb_set(
  COALESCE(social_links, '{}'::jsonb),
  '{website}',
  to_jsonb(website_url),
  true
)
WHERE website_url IS NOT NULL
  AND trim(website_url) <> ''
  AND COALESCE(social_links ->> 'website', '') = '';
