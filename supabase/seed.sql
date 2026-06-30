-- Sample entities for development.
-- Profiles require auth.users rows — seed those after authentication is built.

INSERT INTO public.entities (slug, name, category, image, score, total_votes, followers_count, location) VALUES
  ('costco-pizza',       'Costco Pizza',       'food',          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 612, 14230, 8920,  'United States'),
  ('chick-fil-a',        'Chick-fil-A',        'food',          'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800', 534, 18450, 12100, 'United States'),
  ('kyoto-bamboo-grove', 'Kyoto Bamboo Grove', 'places',        'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800', 720, 4521,  6780,  'Japan'),
  ('breaking-bad',       'Breaking Bad',       'movies_shows',  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800', 890, 45200, 28900, 'United States'),
  ('disneyland',         'Disneyland',         'entertainment', 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?w=800', 740, 32100, 19800, 'United States')
ON CONFLICT (slug) DO NOTHING;

-- Food locations for Chick-fil-A
INSERT INTO public.food_locations (entity_id, restaurant, address, city, location, score, total_votes)
SELECT e.id, 'Chick-fil-A', '1000 Peachtree St NE', 'Atlanta, GA', 'United States', 610, 3100
FROM public.entities e
WHERE e.slug = 'chick-fil-a'
  AND NOT EXISTS (
    SELECT 1 FROM public.food_locations fl
    WHERE fl.entity_id = e.id AND fl.address = '1000 Peachtree St NE'
  );

INSERT INTO public.food_locations (entity_id, restaurant, address, city, location, score, total_votes)
SELECT e.id, 'Chick-fil-A', '1440 Broadway', 'New York, NY', 'United States', 180, 2900
FROM public.entities e
WHERE e.slug = 'chick-fil-a'
  AND NOT EXISTS (
    SELECT 1 FROM public.food_locations fl
    WHERE fl.entity_id = e.id AND fl.address = '1440 Broadway'
  );
