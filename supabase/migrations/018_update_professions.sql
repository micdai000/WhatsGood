-- Replace legacy profession categories with Meritt Pros service fields.

INSERT INTO public.professions (name, slug, icon) VALUES
  ('Car Detailing',       'car-detailing',     'car'),
  ('Photography',         'photography',       'camera'),
  ('Tutoring & Coaching', 'tutoring-coaching', 'graduation-cap'),
  ('Home Services',       'home-services',     'home'),
  ('Tech Services',       'tech-services',     'laptop')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  is_disabled = false;

UPDATE public.profiles
SET profession_id = (SELECT id FROM public.professions WHERE slug = 'photography' LIMIT 1)
WHERE profession_id IN (
  SELECT id FROM public.professions WHERE slug = 'photographer'
);

UPDATE public.profiles
SET profession_id = (SELECT id FROM public.professions WHERE slug = 'tutoring-coaching' LIMIT 1)
WHERE profession_id IN (
  SELECT id FROM public.professions WHERE slug IN (
    'tutor', 'life-coach', 'music-teacher', 'personal-trainer', 'therapist'
  )
);

UPDATE public.profiles
SET profession_id = (SELECT id FROM public.professions WHERE slug = 'tech-services' LIMIT 1)
WHERE profession_id IN (
  SELECT id FROM public.professions WHERE slug IN ('consultant', 'accountant')
);

UPDATE public.professions
SET is_disabled = true
WHERE slug IN (
  'tutor',
  'therapist',
  'life-coach',
  'consultant',
  'personal-trainer',
  'music-teacher',
  'photographer',
  'accountant'
);
