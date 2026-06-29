-- Reviews left by clients for a professional.
-- Reviewers do NOT need an account — name and email are stored directly.
-- The verified flag distinguishes reviews submitted via a review_request token.
-- rating is constrained to 1-5 at the database level.

CREATE TABLE public.reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_name       TEXT NOT NULL,
  reviewer_email      TEXT NOT NULL,
  rating              INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text         TEXT,
  service_description TEXT,
  verified            BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews (public profile pages)
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Insert is restricted: no open client-side inserts.
-- Reviews will be created through a server-side API route that validates
-- the review request token. No INSERT policy is defined here intentionally.
-- When the API route is built, it will use the service_role key to bypass RLS.

-- Trigger: update the parent profile's average_rating and total_reviews
-- whenever a new review is inserted.
CREATE OR REPLACE FUNCTION public.handle_new_review()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_reviews  = (SELECT COUNT(*) FROM public.reviews WHERE profile_id = NEW.profile_id),
    average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE profile_id = NEW.profile_id),
    updated_at     = now()
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_inserted
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_review();
