import { describe, expect, it } from "vitest";
import {
  currentBadgePeriod,
  formatReputationUpdatedLabel,
} from "@/lib/badges/reputation-copy";

import {
  HOW_BADGE_WORKS_SUMMARY,
  REPUTATION_HISTORY_SECTION_ID,
} from "@/lib/badges/reputation-copy";

describe("reputation copy", () => {
  it("labels the current month as updated this month", () => {
    const now = new Date();
    const period = currentBadgePeriod(now);
    expect(formatReputationUpdatedLabel(period)).toBe("Updated this month");
  });

  it("labels prior months with month and year", () => {
    expect(formatReputationUpdatedLabel("2026-07")).toBe("Updated July 2026");
  });

  it("handles missing period", () => {
    expect(formatReputationUpdatedLabel(null)).toBe("Not updated this month yet");
  });

  it("exposes step 4 badge trust summary", () => {
    expect(HOW_BADGE_WORKS_SUMMARY).toContain("recalculated monthly");
    expect(REPUTATION_HISTORY_SECTION_ID).toBe("reputation-history");
  });
});
