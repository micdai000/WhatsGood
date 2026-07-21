import { describe, expect, it } from "vitest";
import {
  formatNextVoteEligibleAt,
  getNextVoteEligibleAt,
  getVoteMonthStart,
  MONTHLY_VOTE_LIMIT_MESSAGE,
} from "@/lib/reviews/vote-limit";

describe("vote limit", () => {
  it("exposes a monthly limit message", () => {
    expect(MONTHLY_VOTE_LIMIT_MESSAGE).toContain("this month");
  });

  it("returns the first day of the current UTC month", () => {
    expect(getVoteMonthStart(new Date("2026-06-15T12:00:00.000Z"))).toEqual(
      new Date("2026-06-01T00:00:00.000Z"),
    );
  });

  it("returns the first day of the next UTC month", () => {
    expect(getNextVoteEligibleAt(new Date("2026-06-15T12:00:00.000Z"))).toEqual(
      new Date("2026-07-01T00:00:00.000Z"),
    );
    expect(getNextVoteEligibleAt(new Date("2026-12-20T00:00:00.000Z"))).toEqual(
      new Date("2027-01-01T00:00:00.000Z"),
    );
  });

  it("formats the next eligible vote date", () => {
    expect(formatNextVoteEligibleAt(new Date("2026-06-15T12:00:00.000Z"))).toBe(
      "July 1, 2026",
    );
  });
});
