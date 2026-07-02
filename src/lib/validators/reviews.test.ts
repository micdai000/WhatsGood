import { describe, expect, it } from "vitest";
import {
  createReviewRequestSchema,
  reviewRequestTokenSchema,
} from "@/lib/validators/review-request";
import { createReviewSchema, leaveReviewSchema } from "@/lib/validators/review";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("review validators", () => {
  describe("createReviewSchema", () => {
    it("accepts valid review input", () => {
      const result = createReviewSchema.safeParse({
        profileId: VALID_UUID,
        reviewerName: "Alex Reviewer",
        reviewerEmail: "alex@example.com",
        rating: 5,
        title: "Excellent work",
        body: "Detailed and thoughtful collaboration throughout the project.",
        wouldRecommend: true,
        relationship: "client",
      });

      expect(result.success).toBe(true);
    });

    it("rejects ratings outside 1-5", () => {
      const result = createReviewSchema.safeParse({
        profileId: VALID_UUID,
        reviewerName: "Alex Reviewer",
        reviewerEmail: "alex@example.com",
        rating: 6,
        title: "Excellent work",
        body: "Detailed and thoughtful collaboration throughout the project.",
        wouldRecommend: true,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("leaveReviewSchema", () => {
    it("requires slug or request token", () => {
      const result = leaveReviewSchema.safeParse({
        reviewerName: "Alex Reviewer",
        reviewerEmail: "alex@example.com",
        rating: 4,
        title: "Great experience",
        body: "Would work together again on future projects.",
        wouldRecommend: true,
      });

      expect(result.success).toBe(false);
    });

    it("accepts review request token", () => {
      const result = leaveReviewSchema.safeParse({
        requestToken: VALID_UUID,
        reviewerName: "Alex Reviewer",
        reviewerEmail: "alex@example.com",
        rating: 4,
        title: "Great experience",
        body: "Would work together again on future projects.",
        wouldRecommend: true,
      });

      expect(result.success).toBe(true);
    });
  });
});

describe("review request validators", () => {
  it("validates create review request input", () => {
    const result = createReviewRequestSchema.safeParse({
      profileId: VALID_UUID,
      email: "client@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("validates token format", () => {
    const result = reviewRequestTokenSchema.safeParse({ token: VALID_UUID });
    expect(result.success).toBe(true);
  });
});
