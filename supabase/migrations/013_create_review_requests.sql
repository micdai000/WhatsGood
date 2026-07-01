-- TrustLoop review requests — shareable links for clients to leave reviews.

CREATE TYPE public.review_request_status AS ENUM ('pending', 'completed', 'expired');

CREATE TABLE IF NOT EXISTS public.review_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  token        UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status       public.review_request_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_review_requests_profile_id
  ON public.review_requests (profile_id);

CREATE INDEX IF NOT EXISTS idx_review_requests_token
  ON public.review_requests (token);

CREATE INDEX IF NOT EXISTS idx_review_requests_profile_created
  ON public.review_requests (profile_id, created_at DESC);

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS review_request_id UUID
    REFERENCES public.review_requests(id) ON DELETE SET NULL;

ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Review requests readable by token holders" ON public.review_requests;
CREATE POLICY "Review requests readable by token holders"
  ON public.review_requests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Profile owners can create review requests" ON public.review_requests;
CREATE POLICY "Profile owners can create review requests"
  ON public.review_requests FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Profile owners can update their review requests" ON public.review_requests;
CREATE POLICY "Profile owners can update their review requests"
  ON public.review_requests FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Complete a pending request after a client submits a review (server-side RPC).
CREATE OR REPLACE FUNCTION public.complete_review_request(p_token UUID)
RETURNS public.review_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req public.review_requests;
BEGIN
  SELECT * INTO req
  FROM public.review_requests
  WHERE token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review request not found' USING ERRCODE = 'P0002';
  END IF;

  IF req.expires_at < now() THEN
    UPDATE public.review_requests
    SET status = 'expired'
    WHERE id = req.id;
    RAISE EXCEPTION 'Review request has expired' USING ERRCODE = 'P0001';
  END IF;

  IF req.status = 'completed' THEN
    RETURN req;
  END IF;

  IF req.status = 'expired' THEN
    RAISE EXCEPTION 'Review request has expired' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.review_requests
  SET status = 'completed', completed_at = now()
  WHERE id = req.id
  RETURNING * INTO req;

  RETURN req;
END;
$$;
