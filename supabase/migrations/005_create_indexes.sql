-- ============================================================
-- Performance indexes
-- ============================================================

-- profiles.slug: Every public profile page is loaded by slug (/p/john-doe).
-- Without this index, every page load would trigger a full table scan.
CREATE INDEX idx_profiles_slug ON public.profiles (slug);

-- profiles.profession_id: Filtering professionals by category
-- (e.g. "show me all electricians") is a primary use case.
CREATE INDEX idx_profiles_profession ON public.profiles (profession_id);

-- profiles.city, profiles.state: Location-based search
-- ("plumbers in Denver, CO") is core functionality.
CREATE INDEX idx_profiles_location ON public.profiles (state, city);

-- reviews.profile_id: Loading all reviews for a profile page.
-- This is the most frequent join in the app.
CREATE INDEX idx_reviews_profile ON public.reviews (profile_id);

-- reviews.created_at: Reviews are displayed newest-first.
-- Sorting without an index forces a full scan + sort.
CREATE INDEX idx_reviews_created ON public.reviews (created_at DESC);

-- review_requests.profile_id: Dashboard view listing
-- all requests a professional has sent.
CREATE INDEX idx_review_requests_profile ON public.review_requests (profile_id);

-- review_requests.token: The review submission page looks up
-- the request by token to validate it. Must be fast.
CREATE INDEX idx_review_requests_token ON public.review_requests (token);

-- professions.slug: SEO-friendly profession pages (/profession/electrician).
CREATE INDEX idx_professions_slug ON public.professions (slug);
