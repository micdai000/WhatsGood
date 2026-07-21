-- New professionals start at Gold Tier 1 instead of "Building trust".

ALTER TABLE public.profiles
  ALTER COLUMN current_badge_tier SET DEFAULT 'gold';

ALTER TABLE public.profiles
  ALTER COLUMN current_badge_sub_tier SET DEFAULT 1;
