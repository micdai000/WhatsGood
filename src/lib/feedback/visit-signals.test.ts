import { describe, expect, it } from "vitest";
import { buildSubmitFeedbackInput } from "@/lib/feedback/build-submit-input";
import {
  summarizeFeedback,
  wouldRecommendForVisit,
} from "@/lib/feedback/visit-signals";

describe("visit signals", () => {
  it("keeps an okay visit out of the recommend yes/no", () => {
    expect(wouldRecommendForVisit("recommend")).toBe(true);
    expect(wouldRecommendForVisit("okay")).toBeNull();
    expect(wouldRecommendForVisit("would_not")).toBe(false);
  });

  it("stores the taps and derives recommend from the visit", () => {
    const input = buildSubmitFeedbackInput({
      businessId: "660e8400-e29b-41d4-a716-446655440000",
      experienceType: "Customer",
      feedback: {
        visit: "okay",
        keptWord: "partly",
        worthIt: "yes",
        treated: "fair",
      },
    });

    expect(input.wouldRecommend).toBeNull();
    expect(input.feedbackData).toEqual({
      visit: "okay",
      keptWord: "partly",
      worthIt: "yes",
      treated: "fair",
    });
    expect(input.feedbackData).not.toHaveProperty("comment");
  });

  it("summarizes a structured visit for the business", () => {
    const summary = summarizeFeedback({
      wouldRecommend: false,
      experienceType: "Client",
      feedbackData: {
        visit: "would_not",
        keptWord: "no",
        worthIt: "partly",
        treated: "poorly",
      },
    });

    expect(summary.title).toBe("Would not go back");
    expect(summary.lines).toEqual([
      "Did not do what they said",
      "Partly worth it",
      "Treated poorly",
      "Client",
    ]);
  });

  it("still describes older yes/no feedback", () => {
    const summary = summarizeFeedback({
      wouldRecommend: true,
      experienceType: "Visitor",
      feedbackData: {},
    });

    expect(summary.title).toBe("Would recommend");
    expect(summary.lines).toEqual(["Visitor"]);
  });
});
