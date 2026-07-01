-- Indexes to support TrustLoop professional search and discovery.

CREATE INDEX IF NOT EXISTS idx_profiles_profession_city_state
  ON public.profiles (profession_id, city, state);

CREATE INDEX IF NOT EXISTS idx_profiles_display_name
  ON public.profiles (display_name);

CREATE INDEX IF NOT EXISTS idx_profiles_username
  ON public.profiles (username);

CREATE INDEX IF NOT EXISTS idx_profiles_average_rating_desc
  ON public.profiles (average_rating DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_total_reviews_desc
  ON public.profiles (total_reviews DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc
  ON public.profiles (created_at DESC);
