-- Badge ranks: Bronze, Silver, Gold, Platinum, Elite — each with sub-tiers 1–3.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_current_badge_tier_check;

ALTER TABLE public.badge_snapshots
  DROP CONSTRAINT IF EXISTS badge_snapshots_badge_tier_check;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_badge_sub_tier INTEGER
    CHECK (current_badge_sub_tier IS NULL OR current_badge_sub_tier BETWEEN 1 AND 3);

ALTER TABLE public.badge_snapshots
  ADD COLUMN IF NOT EXISTS badge_sub_tier INTEGER
    CHECK (badge_sub_tier IS NULL OR badge_sub_tier BETWEEN 1 AND 3);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_current_badge_tier_check
  CHECK (current_badge_tier IN ('none', 'bronze', 'silver', 'gold', 'platinum', 'elite'));

ALTER TABLE public.badge_snapshots
  ADD CONSTRAINT badge_snapshots_badge_tier_check
  CHECK (badge_tier IN ('none', 'bronze', 'silver', 'gold', 'platinum', 'elite'));
