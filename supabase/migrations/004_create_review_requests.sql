-- Review requests sent by professionals to their clients.
-- Each request generates a unique token embedded in an email link.
-- Status lifecycle: pending → completed | expired

CREATE TYPE public.review_request_status AS ENUM ('pending', 'completed', 'expired');

CREATE TABLE public.review_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  token       UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status      public.review_request_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;

-- Only the profile owner can see their own review requests
CREATE POLICY "Users can read their own review requests"
  ON public.review_requests
  FOR SELECT
  USING (auth.uid() = profile_id);

-- Only the profile owner can create review requests
CREATE POLICY "Users can insert their own review requests"
  ON public.review_requests
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);
