export const RECENCY_HALF_LIFE_DAYS = 45;

export const VERIFIED_MULTIPLIER = 1.5;

export const BAYESIAN_CONFIDENCE_C = 10;

export const TRUST_SCORE_WEIGHTS = {
  starQuality: 0.6,
  recommendConfidence: 0.4,
} as const;

export const MIN_REVIEWS_FOR_ELIGIBILITY = 3;

export const MIN_COHORT_SIZE_FOR_PERCENTILE = 10;

export const PERCENTILE_CUTOFFS = {
  elite: 5,
  platinum: 12,
  gold: 25,
  silver: 50,
} as const;

export const FIXED_THRESHOLD_FALLBACK = {
  elite: 90,
  platinum: 80,
  gold: 65,
  silver: 45,
  bronze: 30,
} as const;

export const BADGE_TIERS = [
  "none",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "elite",
] as const;

export const BADGE_SUB_TIERS = [1, 2, 3] as const;

/** Every new professional starts here so profiles don't feel empty on day one. */
export const STARTER_BADGE = {
  tier: "gold",
  subTier: 1,
} as const;
