import { describe, expect, it } from "vitest";
import {
  buildTrustVoteReviewContent,
  EXPERIENCE_FEEDBACK_HEADING,
  getTrustSignalLabel,
  getTrustSignalOption,
  getWouldRecommendForRating,
  isTrustVotePlaceholder,
  TRUST_SIGNALS,
} from "@/lib/reviews/trust-signals";

describe("trust signals", () => {
  it("maps experience options to separated rating values", () => {
    expect(TRUST_SIGNALS.map((option) => option.value)).toEqual([5, 3, 1]);
    expect(TRUST_SIGNALS.map((option) => option.label)).toEqual([
      "Great",
      "Good",
      "Poor",
    ]);
  });

  it("derives recommendation intent from the experience rating", () => {
    expect(getWouldRecommendForRating(5)).toBe(true);
    expect(getWouldRecommendForRating(3)).toBe(true);
    expect(getWouldRecommendForRating(1)).toBe(false);
  });

  it("labels legacy star ratings with the closest experience option", () => {
    expect(getTrustSignalLabel(4)).toBe("Great");
    expect(getTrustSignalLabel(2)).toBe("Poor");
  });

  it("returns experience metadata for stored ratings", () => {
    expect(getTrustSignalOption(3)?.label).toBe("Good");
    expect(EXPERIENCE_FEEDBACK_HEADING).toBe("How was your experience?");
  });

  it("builds placeholder review content from experience feedback", () => {
    expect(buildTrustVoteReviewContent(5, "Silas Jeppson")).toEqual({
      title: "Great experience",
      body: "Great experience with Silas Jeppson.",
    });
  });

  it("detects auto-generated experience placeholder copy", () => {
    expect(
      isTrustVotePlaceholder({
        rating: 5,
        title: "Great experience",
        body: "Great experience with Michael Davila.",
      }),
    ).toBe(true);
  });

  it("still detects legacy trust vote placeholder copy", () => {
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
