import { afterEach, describe, expect, it, vi } from "vitest";
import {
  computeRatingDistribution,
  computeRecentActivity,
  computeReviewGrowth,
  computeStatistics,
  type DashboardSourceData,
} from "@/services/dashboard/dashboard.analytics";

function createReview(overrides: Partial<DashboardSourceData["reviews"][number]> = {}) {
  return {
    id: "review-1",
    profileId: "profile-1",
    reviewerName: "Alex",
    reviewerEmail: "alex@example.com",
    rating: 5,
    title: "Great work",
    body: "Highly recommend",
    wouldRecommend: true,
    relationship: "client",
    verified: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("dashboard analytics", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("computes request success rate", () => {
    const stats = computeStatistics({
      averageRating: 4.8,
      totalReviews: 2,
      reviews: [],
      requests: [
        {
          id: "1",
          profileId: "p1",
          email: "a@example.com",
          token: "t1",
          status: "completed",
          createdAt: "2026-01-01T00:00:00.000Z",
          expiresAt: "2026-02-01T00:00:00.000Z",
          completedAt: "2026-01-15T00:00:00.000Z",
        },
        {
          id: "2",
          profileId: "p1",
          email: "b@example.com",
          token: "t2",
          status: "expired",
          createdAt: "2026-01-01T00:00:00.000Z",
          expiresAt: "2026-02-01T00:00:00.000Z",
          completedAt: null,
        },
      ],
    });

    expect(stats.reviewRequestSuccessRate).toBe(50);
    expect(stats.pendingReviewRequests).toBe(0);
  });

  it("computes review growth windows", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-29T12:00:00.000Z"));

    const growth = computeReviewGrowth([
      createReview({ createdAt: "2026-06-20T00:00:00.000Z" }),
      createReview({ createdAt: "2026-05-15T00:00:00.000Z" }),
      createReview({ createdAt: "2026-04-01T00:00:00.000Z" }),
    ]);

    expect(growth.last30Days).toBe(1);
    expect(growth.previous30Days).toBe(1);
    expect(growth.changePercent).toBe(0);
  });

  it("builds rating distribution", () => {
    const breakdown = computeRatingDistribution([
      createReview({ rating: 5 }),
      createReview({ id: "review-2", rating: 4 }),
      createReview({ id: "review-3", rating: 5 }),
    ]);

    expect(breakdown.counts[5]).toBe(2);
    expect(breakdown.counts[4]).toBe(1);
    expect(breakdown.total).toBe(3);
  });

  it("sorts recent activity by timestamp", () => {
    const activity = computeRecentActivity(
      [createReview({ createdAt: "2026-06-01T00:00:00.000Z" })],
      [
        {
          id: "req-1",
          profileId: "p1",
          email: "newer@example.com",
          token: "token",
          status: "pending",
          createdAt: "2026-06-10T00:00:00.000Z",
          expiresAt: "2026-07-10T00:00:00.000Z",
          completedAt: null,
        },
      ],
      5,
    );

    expect(activity[0]?.type).toBe("review_request_created");
  });
});
