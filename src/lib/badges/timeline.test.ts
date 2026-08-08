import { describe, expect, it } from "vitest";
import type { BadgeSnapshot } from "@/types/badge";
import {
  buildReputationTimeline,
  formatCurrentTimelineLabel,
  getLatestBadgeSnapshot,
  TIER_TIMELINE_ABBREV,
} from "@/lib/badges/timeline";

function snapshot(period: string, badgeTier: BadgeSnapshot["badgeTier"]): BadgeSnapshot {
  return {
    id: period,
    profileId: "p1",
    period,
    trustScore: 80,
    percentile: 10,
    badgeTier,
    badgeSubTier: 2,
    reviewCountWindow: 5,
    eligible: true,
    componentBreakdown: {
      bayesian_avg: 4,
      wilson_recommend: 0.9,
      verified_ratio: 1,
      review_count_window: 5,
    },
    computedAt: `${period}-01T00:00:00.000Z`,
  };
}

describe("reputation timeline", () => {
  it("maps tier abbreviations for the timeline row", () => {
    expect(TIER_TIMELINE_ABBREV.gold).toBe("G");
    expect(TIER_TIMELINE_ABBREV.elite).toBe("E");
  });

  it("builds 12 chronological months with snapshot tiers", () => {
    const history = [
      snapshot("2026-06", "gold"),
      snapshot("2026-07", "platinum"),
      snapshot("2026-08", "elite"),
    ];

    const timeline = buildReputationTimeline(
      history,
      12,
      new Date("2026-08-15T12:00:00.000Z"),
    );

    expect(timeline).toHaveLength(12);
    expect(timeline.at(-1)?.period).toBe("2026-08");
    expect(timeline.at(-1)?.tier).toBe("elite");
    expect(timeline.at(-2)?.tier).toBe("platinum");
    expect(timeline.at(0)?.hasData).toBe(false);
  });

  it("formats the current label from the latest period", () => {
    const latest = getLatestBadgeSnapshot([
      snapshot("2026-06", "silver"),
      snapshot("2026-08", "elite"),
    ]);

    expect(formatCurrentTimelineLabel(latest)).toBe("Current: Elite · Tier 2");
  });
});
