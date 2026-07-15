import { describe, expect, it } from "vitest";
import {
  assignBadgeTiers,
  computeBayesianAverage,
  computePercentile,
  computeProfileTrustScore,
  computeRecencyWeight,
  computeTrustScore,
  computeWilsonRecommendLowerBound,
  tierFromFixedThreshold,
  tierFromPercentile,
  type ScoringReview,
} from "@/services/badges/badge-scoring";

const COMPUTE_DATE = new Date("2026-07-01T12:00:00.000Z");

function createReview(overrides: Partial<ScoringReview> = {}): ScoringReview {
  return {
    rating: 5,
    wouldRecommend: true,
    verified: false,
    createdAt: COMPUTE_DATE.toISOString(),
    ...overrides,
  };
}

describe("badge scoring", () => {
  describe("computeRecencyWeight", () => {
    it("returns ~1.0 at 0 days", () => {
      expect(computeRecencyWeight(0)).toBeCloseTo(1, 5);
    });

    it("returns exp(-1) at 45 days", () => {
      expect(computeRecencyWeight(45)).toBeCloseTo(Math.exp(-1), 5);
    });

    it("returns exp(-2) at 90 days", () => {
      expect(computeRecencyWeight(90)).toBeCloseTo(Math.exp(-2), 5);
    });
  });

  describe("computeBayesianAverage", () => {
    it("shrinks toward profession mean with no reviews", () => {
      expect(computeBayesianAverage(3.5, [])).toBeCloseTo(3.5, 5);
    });

    it("shrinks a single high rating toward the profession mean", () => {
      const result = computeBayesianAverage(3, [{ weight: 1, rating: 5 }]);
      expect(result).toBeCloseTo(35 / 11, 5);
    });

    it("moves closer to observed ratings with many reviews", () => {
      const weightedRatings = Array.from({ length: 50 }, () => ({
        weight: 1,
        rating: 5,
      }));

      const result = computeBayesianAverage(3, weightedRatings);
      expect(result).toBeCloseTo(280 / 60, 5);
    });
  });

  describe("computeWilsonRecommendLowerBound", () => {
    it("returns 0 when total weight is 0", () => {
      expect(computeWilsonRecommendLowerBound(0, 0)).toBe(0);
    });

    it("matches a known reference value for p=0.5 and n=10", () => {
      expect(computeWilsonRecommendLowerBound(5, 10)).toBeCloseTo(0.2366, 3);
    });

    it("stays below the raw proportion for small samples", () => {
      const lower = computeWilsonRecommendLowerBound(1, 1);
      expect(lower).toBeLessThan(1);
      expect(lower).toBeGreaterThan(0);
    });
  });

  describe("computeTrustScore", () => {
    it("combines bayesian average and wilson recommend with 60/40 weighting", () => {
      const score = computeTrustScore(5, 1);
      expect(score).toBeCloseTo(100, 5);
    });

    it("returns 0 when both inputs are 0", () => {
      expect(computeTrustScore(0, 0)).toBe(0);
    });
  });

  describe("computeProfileTrustScore", () => {
    it("returns zeros and ineligible for an empty window", () => {
      const result = computeProfileTrustScore([], 4, COMPUTE_DATE);

      expect(result.trustScore).toBe(0);
      expect(result.eligible).toBe(false);
      expect(result.reviewCountWindow).toBe(0);
      expect(result.componentBreakdown).toEqual({
        bayesian_avg: 0,
        wilson_recommend: 0,
        verified_ratio: 0,
        review_count_window: 0,
      });
    });

    it("marks profiles with fewer than 3 reviews as ineligible", () => {
      const result = computeProfileTrustScore(
        [
          createReview({ rating: 5 }),
          createReview({ rating: 4, createdAt: "2026-06-01T00:00:00.000Z" }),
        ],
        4,
        COMPUTE_DATE,
      );

      expect(result.reviewCountWindow).toBe(2);
      expect(result.eligible).toBe(false);
      expect(result.trustScore).toBeGreaterThan(0);
    });

    it("applies verified multiplier through effective weights", () => {
      const unverified = computeProfileTrustScore(
        [
          createReview({ verified: false }),
          createReview({ verified: false }),
          createReview({ verified: false }),
        ],
        3,
        COMPUTE_DATE,
      );

      const verified = computeProfileTrustScore(
        [
          createReview({ verified: true }),
          createReview({ verified: true }),
          createReview({ verified: true }),
        ],
        3,
        COMPUTE_DATE,
      );

      expect(verified.trustScore).toBeGreaterThan(unverified.trustScore);
      expect(verified.componentBreakdown.verified_ratio).toBe(1);
    });
  });

  describe("tierFromPercentile", () => {
    it("maps cutoff boundaries exactly", () => {
      expect(tierFromPercentile(5)).toBe("elite");
      expect(tierFromPercentile(20)).toBe("gold");
      expect(tierFromPercentile(50)).toBe("silver");
      expect(tierFromPercentile(51)).toBe("bronze");
    });
  });

  describe("computePercentile", () => {
    it("computes rank-based percentile within a cohort", () => {
      expect(computePercentile(1, 20)).toBe(5);
      expect(computePercentile(4, 20)).toBe(20);
      expect(computePercentile(10, 20)).toBe(50);
    });
  });

  describe("tierFromFixedThreshold", () => {
    it("maps fixed trust score thresholds", () => {
      expect(tierFromFixedThreshold(90)).toBe("elite");
      expect(tierFromFixedThreshold(75)).toBe("gold");
      expect(tierFromFixedThreshold(55)).toBe("silver");
      expect(tierFromFixedThreshold(35)).toBe("bronze");
      expect(tierFromFixedThreshold(34.9)).toBe("none");
    });
  });

  describe("assignBadgeTiers", () => {
    it("uses percentile ranking for cohorts of 10 or more", () => {
      const profiles = Array.from({ length: 20 }, (_, index) => ({
        profileId: `profile-${index}`,
        trustScore: 100 - index,
        eligible: true,
      }));

      const tiers = assignBadgeTiers(profiles);
      const top = tiers.find((tier) => tier.profileId === "profile-0");

      expect(top?.badgeTier).toBe("elite");
      expect(top?.percentile).toBe(5);
    });

    it("falls back to fixed thresholds for small cohorts", () => {
      const tiers = assignBadgeTiers([
        { profileId: "a", trustScore: 92, eligible: true },
        { profileId: "b", trustScore: 40, eligible: true },
        { profileId: "c", trustScore: 10, eligible: true },
        { profileId: "d", trustScore: 95, eligible: true },
      ]);

      expect(tiers).toEqual(
        expect.arrayContaining([
          { profileId: "a", badgeTier: "elite", percentile: null },
          { profileId: "d", badgeTier: "elite", percentile: null },
          { profileId: "b", badgeTier: "bronze", percentile: null },
          { profileId: "c", badgeTier: "none", percentile: null },
        ]),
      );
    });

    it("assigns none to ineligible profiles", () => {
      const tiers = assignBadgeTiers([
        { profileId: "ineligible", trustScore: 99, eligible: false },
      ]);

      expect(tiers).toEqual([
        { profileId: "ineligible", badgeTier: "none", percentile: null },
      ]);
    });
  });
});
