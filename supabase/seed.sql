-- ============================================================
-- Seed data: Professions
-- Add more rows here as the platform grows.
-- ============================================================

INSERT INTO public.professions (name, slug, icon) VALUES
  ('Plumber',       'plumber',       'wrench'),
  ('Electrician',   'electrician',   'zap'),
  ('Photographer',  'photographer',  'camera'),
  ('Personal Trainer', 'personal-trainer', 'dumbbell'),
  ('Landscaper',    'landscaper',    'trees'),
  ('House Cleaner', 'house-cleaner', 'sparkles'),
  ('Handyman',      'handyman',      'hammer'),
  ('Tutor',         'tutor',         'book-open'),
  ('Real Estate Agent', 'real-estate-agent', 'home'),
  ('Contractor',    'contractor',    'hard-hat')
ON CONFLICT (slug) DO NOTHING;
