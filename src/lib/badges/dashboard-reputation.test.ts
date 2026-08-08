import { describe, expect, it } from "vitest";
import type { BadgeSnapshot } from "@/types/badge";
import {
  buildDashboardReputationSummary,
  computeConsecutiveActiveMonths,
  formatTierMovementMessage,
  getNextBadgeTier,
} from "@/lib/badges/dashboard-reputation";

function snapshot(
  period: string,
  badgeTier: BadgeSnapshot["badgeTier"],
  overrides: Partial<BadgeSnapshot> = {},
): BadgeSnapshot {
  return {
    id: period,
    profileId: "p1",
    period,
    trustScore: 70,
    percentile: 20,
    badgeTier,
    badgeSubTier: 2,
    reviewCountWindow: 5,
    eligible: true,
    componentBreakdown: {
      bayesian_avg: 4.2,
      wilson_recommend: 0.88,
      verified_ratio: 1,
      review_count_window: 5,
    },
    computedAt: `${period}-01T00:00:00.000Z`,
    ...overrides,
  };
}

describe("dashboard reputation", () => {
  it("detects tier movement between months", () => {
    expect(formatTierMovementMessage("gold", "silver")).toBe(
      "You moved up from Silver this month.",
    );
  });

  it("returns the next tier above the current tier", () => {
    expect(getNextBadgeTier("gold")).toBe("platinum");
    expect(getNextBadgeTier("elite")).toBeNull();
  });

  it("counts consecutive active months from the latest period", () => {
    const history = [
      snapshot("2026-08", "gold"),
      snapshot("2026-07", "gold"),
      snapshot("2026-06", "silver", { eligible: false }),
    ];

    expect(computeConsecutiveActiveMonths(history)).toBe(2);
  });

  it("builds a dashboard summary from badge history", () => {
    const summary = buildDashboardReputationSummary("gold", [
      snapshot("2026-08", "gold"),
      snapshot("2026-07", "silver"),
    ]);

    expect(summary.movementMessage).toContain("Silver");
    expect(summary.verifiedExperiencesWindow).toBe(5);
    expect(summary.recommendationRatePercent).toBe(88);
    expect(summary.nextTier).toBe("platinum");
  });
});
