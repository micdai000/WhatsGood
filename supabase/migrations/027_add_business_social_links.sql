-- Professional Links on public business profiles.
-- Same JSONB shape as profiles.social_links so website / Instagram / etc.
-- can be added without new columns. website_url stays in sync for older reads.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.businesses.social_links IS
  'External professional profile links, e.g. {"instagram":"","facebook":"","x":"","website":""}. Extensible by key.';

UPDATE public.businesses
SET social_links = jsonb_set(
  COALESCE(social_links, '{}'::jsonb),
  '{website}',
  to_jsonb(website_url)
)
WHERE website_url IS NOT NULL
  AND trim(website_url) <> ''
  AND COALESCE(social_links->>'website', '') = '';
