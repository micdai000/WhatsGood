import { describe, expect, it } from "vitest";
import { submitFeedbackSchema } from "@/lib/validators/feedback";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("submitFeedbackSchema", () => {
  it("accepts feedback with only a business id", () => {
    const result = submitFeedbackSchema.safeParse({
      businessId: VALID_UUID,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.feedbackData).toEqual({});
      expect(result.data.wouldRecommend).toBeUndefined();
    }
  });

  it("does not require a rating or comment", () => {
    const result = submitFeedbackSchema.safeParse({
      businessId: VALID_UUID,
      wouldRecommend: true,
      experienceType: "first_visit",
      feedbackData: { waitTime: "short" },
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid business id", () => {
    const result = submitFeedbackSchema.safeParse({
      businessId: "not-a-uuid",
    });

    expect(result.success).toBe(false);
  });
});
