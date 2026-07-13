-- TrustLoop badge snapshots — monthly earned badges from recency-weighted trust scores.
-- Computed by a scheduled batch job; not updated per-review (see ratings.txt).

CREATE TABLE IF NOT EXISTS public.badge_snapshots (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period              TEXT NOT NULL,
  trust_score         NUMERIC(6, 3) NOT NULL,
  percentile          NUMERIC(5, 2),
  badge_tier          TEXT NOT NULL CHECK (badge_tier IN ('none', 'bronze', 'silver', 'gold', 'elite')),
  review_count_window INTEGER NOT NULL,
  eligible            BOOLEAN NOT NULL,
  component_breakdown JSONB NOT NULL,
  computed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT badge_snapshots_one_per_period UNIQUE (profile_id, period)
);

CREATE INDEX IF NOT EXISTS idx_badge_snapshots_profile_period
  ON public.badge_snapshots (profile_id, period DESC);

CREATE INDEX IF NOT EXISTS idx_badge_snapshots_period_tier
  ON public.badge_snapshots (period, badge_tier);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_badge_tier TEXT NOT NULL DEFAULT 'none'
    CHECK (current_badge_tier IN ('none', 'bronze', 'silver', 'gold', 'elite')),
  ADD COLUMN IF NOT EXISTS current_badge_period TEXT;

ALTER TABLE public.badge_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Badge snapshots are publicly readable" ON public.badge_snapshots;
CREATE POLICY "Badge snapshots are publicly readable"
  ON public.badge_snapshots FOR SELECT
  USING (true);

-- Badge rows are inserted by the scheduled compute job (service role), not clients.
