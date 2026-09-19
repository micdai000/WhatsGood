-- Dedicated Hotel and Barber categories for business onboarding.

INSERT INTO public.business_categories (name, slug, description, icon) VALUES
  ('Barber', 'barber', 'Barbershops and men''s grooming', 'scissors'),
  ('Hotel', 'hotel', 'Hotels, motels, and lodging', 'bed')
ON CONFLICT (slug) DO NOTHING;
