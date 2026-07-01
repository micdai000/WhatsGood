-- TrustLoop reviews and denormalized profile rating statistics.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews   INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_name    TEXT NOT NULL,
  reviewer_email   TEXT NOT NULL,
  rating           INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title            TEXT NOT NULL,
  body             TEXT NOT NULL,
  would_recommend  BOOLEAN NOT NULL DEFAULT true,
  relationship     TEXT,
  verified         BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reviews_one_per_email_per_profile UNIQUE (profile_id, reviewer_email)
);

CREATE INDEX IF NOT EXISTS idx_reviews_profile_id ON public.reviews (profile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_profile_created ON public.reviews (profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews (profile_id, rating);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are publicly readable" ON public.reviews;
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
CREATE POLICY "Anyone can submit a review"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Profile owners can delete reviews on their profile" ON public.reviews;
CREATE POLICY "Profile owners can delete reviews on their profile"
  ON public.reviews FOR DELETE
  USING (auth.uid() = profile_id);

-- Recalculate denormalized rating stats on the profile after review changes.
CREATE OR REPLACE FUNCTION public.handle_review_change()
RETURNS TRIGGER AS $$
DECLARE
  target_profile_id UUID;
  review_count INTEGER;
  avg_rating NUMERIC(3, 2);
BEGIN
  target_profile_id := COALESCE(NEW.profile_id, OLD.profile_id);

  SELECT COUNT(*)::INTEGER, COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0)
  INTO review_count, avg_rating
  FROM public.reviews
  WHERE profile_id = target_profile_id;

  UPDATE public.profiles
  SET
    total_reviews = review_count,
    average_rating = avg_rating
  WHERE id = target_profile_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_review_change();
