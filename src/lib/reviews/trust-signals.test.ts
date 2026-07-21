import { describe, expect, it } from "vitest";
import {
  buildTrustVoteReviewContent,
  getTrustSignalLabel,
  getTrustSignalOption,
  getWouldRecommendForRating,
  isTrustVotePlaceholder,
  TRUST_SIGNALS,
} from "@/lib/reviews/trust-signals";

describe("trust signals", () => {
  it("maps promote, maintain, and demote to separated rating values", () => {
    expect(TRUST_SIGNALS.map((option) => option.value)).toEqual([5, 3, 1]);
  });

  it("derives recommendation intent from the trust signal", () => {
    expect(getWouldRecommendForRating(5)).toBe(true);
    expect(getWouldRecommendForRating(3)).toBe(true);
    expect(getWouldRecommendForRating(1)).toBe(false);
  });

  it("labels legacy star ratings with the closest trust signal", () => {
    expect(getTrustSignalLabel(4)).toBe("Promote");
    expect(getTrustSignalLabel(2)).toBe("Demote");
  });

  it("returns trust signal metadata for stored ratings", () => {
    expect(getTrustSignalOption(3)?.label).toBe("Maintain");
  });

  it("builds placeholder review content from a trust vote", () => {
    expect(
      buildTrustVoteReviewContent(5, "Silas Jeppson"),
    ).toEqual({
      title: "Promote trust vote",
      body: "Promote trust vote for Silas Jeppson.",
    });
  });

  it("detects auto-generated trust vote placeholder copy", () => {
    expect(
      isTrustVotePlaceholder({
        rating: 5,
        title: "Promote trust vote",
        body: "Promote trust vote for Michael Davila.",
      }),
    ).toBe(true);
    expect(
      isTrustVotePlaceholder({
        rating: 5,
        title: "Great experience",
        body: "Would hire again without hesitation.",
      }),
    ).toBe(false);
  });
});
