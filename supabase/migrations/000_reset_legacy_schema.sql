-- Run this once on your Supabase project before applying the new schema.
-- Drops the old TrustLoop tables (professions, reviews, etc.) if they exist.

DROP TABLE IF EXISTS public.activity CASCADE;
DROP TABLE IF EXISTS public.review_requests CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.library_items CASCADE;
DROP TABLE IF EXISTS public.library_follows CASCADE;
DROP TABLE IF EXISTS public.entity_follows CASCADE;
DROP TABLE IF EXISTS public.user_follows CASCADE;
DROP TABLE IF EXISTS public.food_locations CASCADE;
DROP TABLE IF EXISTS public.libraries CASCADE;
DROP TABLE IF EXISTS public.entities CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.professions CASCADE;

DROP TYPE IF EXISTS public.review_request_status CASCADE;
DROP TYPE IF EXISTS public.activity_type CASCADE;
DROP TYPE IF EXISTS public.vote_type CASCADE;
DROP TYPE IF EXISTS public.entity_category CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_review() CASCADE;
DROP FUNCTION IF EXISTS public.handle_vote_change() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
