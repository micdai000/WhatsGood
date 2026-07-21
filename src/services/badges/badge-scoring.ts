import {
  BAYESIAN_CONFIDENCE_C,
  FIXED_THRESHOLD_FALLBACK,
  MIN_COHORT_SIZE_FOR_PERCENTILE,
  MIN_REVIEWS_FOR_ELIGIBILITY,
  PERCENTILE_CUTOFFS,
  RECENCY_HALF_LIFE_DAYS,
  STARTER_BADGE,
  TRUST_SCORE_WEIGHTS,
  VERIFIED_MULTIPLIER,
} from "@/lib/constants/badges";
import type { BadgeSubTier, BadgeTier, ComponentBreakdown } from "@/types/badge";

const REVIEW_WINDOW_DAYS = 90;
const WILSON_Z = 1.96;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface ScoringReview {
  rating: number;
  wouldRecommend: boolean;
  verified: boolean;
  createdAt: Date | string;
}

export interface ProfileTrustScoreResult {
  trustScore: number;
  eligible: boolean;
  reviewCountWindow: number;
  componentBreakdown: ComponentBreakdown;
}

export interface ProfileScoreInput {
  profileId: string;
  trustScore: number;
  eligible: boolean;
}

export interface ProfileTierResult {
  profileId: string;
  badgeTier: BadgeTier;
  badgeSubTier: BadgeSubTier | null;
  percentile: number | null;
}

type EarnedBadgeTier = Exclude<BadgeTier, "none">;

const RANK_PERCENTILE_BANDS: Record<
  EarnedBadgeTier,
  { min: number; max: number }
> = {
  elite: { min: 0, max: PERCENTILE_CUTOFFS.elite },
  platinum: { min: PERCENTILE_CUTOFFS.elite, max: PERCENTILE_CUTOFFS.platinum },
  gold: { min: PERCENTILE_CUTOFFS.platinum, max: PERCENTILE_CUTOFFS.gold },
  silver: { min: PERCENTILE_CUTOFFS.gold, max: PERCENTILE_CUTOFFS.silver },
  bronze: { min: PERCENTILE_CUTOFFS.silver, max: 100 },
};

const RANK_THRESHOLD_ORDER: EarnedBadgeTier[] = [
  "elite",
  "platinum",
  "gold",
  "silver",
  "bronze",
];

export function computeRecencyWeight(daysOld: number): number {
  if (daysOld <= 0) {
    return 1;
  }

  return Math.exp(-daysOld / RECENCY_HALF_LIFE_DAYS);
}

export function computeEffectiveWeight(daysOld: number, verified: boolean): number {
  const recencyWeight = computeRecencyWeight(daysOld);
  const verifiedMultiplier = verified ? VERIFIED_MULTIPLIER : 1;
  return recencyWeight * verifiedMultiplier;
}

export function daysOld(createdAt: Date | string, computeDate: Date): number {
  const created =
    createdAt instanceof Date ? createdAt : new Date(createdAt);
  const diffMs = computeDate.getTime() - created.getTime();
  return Math.max(0, diffMs / MS_PER_DAY);
}

export function filterReviewsInWindow(
  reviews: ScoringReview[],
  computeDate: Date,
  windowDays = REVIEW_WINDOW_DAYS,
): ScoringReview[] {
  const windowStartMs = computeDate.getTime() - windowDays * MS_PER_DAY;

  return reviews.filter((review) => {
    const created =
      review.createdAt instanceof Date
        ? review.createdAt
        : new Date(review.createdAt);
    return created.getTime() >= windowStartMs && created.getTime() <= computeDate.getTime();
  });
}

export function computeBayesianAverage(
  professionMean: number,
  weightedRatings: Array<{ weight: number; rating: number }>,
  confidence = BAYESIAN_CONFIDENCE_C,
): number {
  const weightedSum = weightedRatings.reduce(
    (sum, item) => sum + item.weight * item.rating,
    0,
  );
  const totalWeight = weightedRatings.reduce((sum, item) => sum + item.weight, 0);

  return (confidence * professionMean + weightedSum) / (confidence + totalWeight);
}

export function computeWilsonRecommendLowerBound(
  positiveWeight: number,
  totalWeight: number,
): number {
  if (totalWeight <= 0) {
    return 0;
  }

  const proportion = positiveWeight / totalWeight;
  const zSquared = WILSON_Z * WILSON_Z;
  const denominator = 1 + zSquared / totalWeight;
  const center = proportion + zSquared / (2 * totalWeight);
  const margin =
    WILSON_Z *
    Math.sqrt((proportion * (1 - proportion) + zSquared / (4 * totalWeight)) / totalWeight);

  const lower = (center - margin) / denominator;
  return Math.max(0, Math.min(1, lower));
}

export function computeTrustScore(
  bayesianAvg: number,
  wilsonRecommend: number,
): number {
  const starComponent = (bayesianAvg / 5) * TRUST_SCORE_WEIGHTS.starQuality;
  const recommendComponent =
    wilsonRecommend * TRUST_SCORE_WEIGHTS.recommendConfidence;

  return 100 * (starComponent + recommendComponent);
}

export function computeProfileTrustScore(
  reviews: ScoringReview[],
  professionMean: number,
  computeDate: Date,
): ProfileTrustScoreResult {
  const windowReviews = filterReviewsInWindow(reviews, computeDate);
  const reviewCountWindow = windowReviews.length;

  if (reviewCountWindow === 0) {
    return {
      trustScore: 0,
      eligible: false,
      reviewCountWindow: 0,
      componentBreakdown: {
        bayesian_avg: 0,
        wilson_recommend: 0,
        verified_ratio: 0,
        review_count_window: 0,
      },
    };
  }

  const weightedRatings: Array<{ weight: number; rating: number }> = [];
  let totalWeight = 0;
  let positiveWeight = 0;
  let verifiedCount = 0;

  for (const review of windowReviews) {
    const weight = computeEffectiveWeight(
      daysOld(review.createdAt, computeDate),
      review.verified,
    );

    weightedRatings.push({ weight, rating: review.rating });
    totalWeight += weight;

    if (review.wouldRecommend) {
      positiveWeight += weight;
    }

    if (review.verified) {
      verifiedCount += 1;
    }
  }

  const bayesianAvg = computeBayesianAverage(professionMean, weightedRatings);
  const wilsonRecommend = computeWilsonRecommendLowerBound(
    positiveWeight,
    totalWeight,
  );
  const trustScore = computeTrustScore(bayesianAvg, wilsonRecommend);
  const eligible = reviewCountWindow >= MIN_REVIEWS_FOR_ELIGIBILITY;

  return {
    trustScore,
    eligible,
    reviewCountWindow,
    componentBreakdown: {
      bayesian_avg: bayesianAvg,
      wilson_recommend: wilsonRecommend,
      verified_ratio: verifiedCount / reviewCountWindow,
      review_count_window: reviewCountWindow,
    },
  };
}

export function computePercentile(rank: number, cohortSize: number): number {
  if (cohortSize <= 0) {
    return 100;
  }

  return (rank / cohortSize) * 100;
}

export function tierFromPercentile(percentile: number): BadgeTier {
  if (percentile <= PERCENTILE_CUTOFFS.elite) {
    return "elite";
  }

  if (percentile <= PERCENTILE_CUTOFFS.platinum) {
    return "platinum";
  }

  if (percentile <= PERCENTILE_CUTOFFS.gold) {
    return "gold";
  }

  if (percentile <= PERCENTILE_CUTOFFS.silver) {
    return "silver";
  }

  return "bronze";
}

export function subTierFromPercentile(
  percentile: number,
  rank: BadgeTier,
): BadgeSubTier | null {
  if (rank === "none") {
    return null;
  }

  const band = RANK_PERCENTILE_BANDS[rank];
  const width = band.max - band.min;

  if (width <= 0) {
    return 2;
  }

  const position = (percentile - band.min) / width;

  if (position <= 1 / 3) {
    return 3;
  }

  if (position <= 2 / 3) {
    return 2;
  }

  return 1;
}

export function tierFromFixedThreshold(trustScore: number): BadgeTier {
  if (trustScore >= FIXED_THRESHOLD_FALLBACK.elite) {
    return "elite";
  }

  if (trustScore >= FIXED_THRESHOLD_FALLBACK.platinum) {
    return "platinum";
  }

  if (trustScore >= FIXED_THRESHOLD_FALLBACK.gold) {
    return "gold";
  }

  if (trustScore >= FIXED_THRESHOLD_FALLBACK.silver) {
    return "silver";
  }

  if (trustScore >= FIXED_THRESHOLD_FALLBACK.bronze) {
    return "bronze";
  }

  return "none";
}

export function subTierFromFixedThreshold(
  trustScore: number,
  rank: BadgeTier,
): BadgeSubTier | null {
  if (rank === "none") {
    return null;
  }

  const rankIndex = RANK_THRESHOLD_ORDER.indexOf(rank);
  const upper = FIXED_THRESHOLD_FALLBACK[rank];
  const lower =
    rankIndex < RANK_THRESHOLD_ORDER.length - 1
      ? FIXED_THRESHOLD_FALLBACK[RANK_THRESHOLD_ORDER[rankIndex + 1]]
      : 0;
  const width = upper - lower;

  if (width <= 0) {
    return 2;
  }

  const position = (upper - trustScore) / width;

  if (position <= 1 / 3) {
    return 3;
  }

  if (position <= 2 / 3) {
    return 2;
  }

  return 1;
}

export function assignBadgeTiers(
  profiles: ProfileScoreInput[],
  minCohortSizeForPercentile = MIN_COHORT_SIZE_FOR_PERCENTILE,
): ProfileTierResult[] {
  const ineligible = profiles
    .filter((profile) => !profile.eligible)
    .map((profile) => ({
      profileId: profile.profileId,
      badgeTier: STARTER_BADGE.tier,
      badgeSubTier: STARTER_BADGE.subTier,
      percentile: null,
    }));

  const eligible = profiles.filter((profile) => profile.eligible);
  const usePercentileRanking =
    eligible.length >= minCohortSizeForPercentile;

  if (!usePercentileRanking) {
    return [
      ...ineligible,
      ...eligible.map((profile) => {
        const badgeTier = tierFromFixedThreshold(profile.trustScore);

        return {
          profileId: profile.profileId,
          badgeTier,
          badgeSubTier: subTierFromFixedThreshold(profile.trustScore, badgeTier),
          percentile: null,
        };
      }),
    ];
  }

  const sorted = [...eligible].sort((left, right) => {
    if (right.trustScore !== left.trustScore) {
      return right.trustScore - left.trustScore;
    }

    return left.profileId.localeCompare(right.profileId);
  });

  const cohortSize = sorted.length;
  const ranked = sorted.map((profile, index) => {
    const rank = index + 1;
    const percentile = computePercentile(rank, cohortSize);
    const badgeTier = tierFromPercentile(percentile);

    return {
      profileId: profile.profileId,
      badgeTier,
      badgeSubTier: subTierFromPercentile(percentile, badgeTier),
      percentile,
    };
  });

  return [...ineligible, ...ranked];
}
