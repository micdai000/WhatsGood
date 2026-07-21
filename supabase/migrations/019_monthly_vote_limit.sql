-- Limit trust votes to one per reviewer email per profile per calendar month (UTC).

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_one_per_email_per_profile;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS vote_month DATE GENERATED ALWAYS AS (
    (date_trunc('month', created_at AT TIME ZONE 'UTC'))::date
  ) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_vote_per_email_per_profile_per_month
  ON public.reviews (profile_id, reviewer_email, vote_month);
