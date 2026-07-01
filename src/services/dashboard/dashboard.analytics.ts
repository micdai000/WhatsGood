import type {
  DashboardActivityItem,
  DashboardStatistics,
  RatingBreakdown,
  ReviewGrowth,
  ReviewTrend,
  ReviewTrendPoint,
} from "@/types";
import type { ReviewRow } from "@/services/reviews/review.mapper";
import type { ReviewRequestRow } from "@/services/reviewRequests/review-request.mapper";
import { mapReviewRow } from "@/services/reviews/review.mapper";
import { mapReviewRequestRow } from "@/services/reviewRequests/review-request.mapper";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type DashboardSourceData = {
  averageRating: number;
  totalReviews: number;
  reviews: ReturnType<typeof mapReviewRow>[];
  requests: ReturnType<typeof mapReviewRequestRow>[];
};

export function computeStatistics(data: DashboardSourceData): DashboardStatistics {
  const pendingReviewRequests = data.requests.filter(
    (request) => request.status === "pending",
  ).length;
  const completedReviewRequests = data.requests.filter(
    (request) => request.status === "completed",
  ).length;
  const expiredReviewRequests = data.requests.filter(
    (request) => request.status === "expired",
  ).length;
  const totalReviewRequests = data.requests.length;

  const resolvedRequests = completedReviewRequests + expiredReviewRequests;
  const reviewRequestSuccessRate =
    resolvedRequests > 0
      ? Math.round((completedReviewRequests / resolvedRequests) * 100)
      : null;

  return {
    averageRating: data.averageRating,
    totalReviews: data.totalReviews,
    pendingReviewRequests,
    completedReviewRequests,
    expiredReviewRequests,
    totalReviewRequests,
    reviewRequestSuccessRate,
    reviewGrowth: computeReviewGrowth(data.reviews),
    profileViews: {
      tracked: false,
      label: "Profile views",
      message: "Not yet tracked — coming in a future update",
    },
  };
}

export function computeReviewGrowth(
  reviews: DashboardSourceData["reviews"],
): ReviewGrowth {
  const now = Date.now();
  const last30Start = now - 30 * MS_PER_DAY;
  const previous30Start = now - 60 * MS_PER_DAY;

  let last30Days = 0;
  let previous30Days = 0;

  for (const review of reviews) {
    const created = new Date(review.createdAt).getTime();
    if (created >= last30Start) {
      last30Days += 1;
    } else if (created >= previous30Start && created < last30Start) {
      previous30Days += 1;
    }
  }

  const changePercent =
    previous30Days > 0
      ? Math.round(((last30Days - previous30Days) / previous30Days) * 100)
      : last30Days > 0
        ? 100
        : null;

  return { last30Days, previous30Days, changePercent };
}

export function computeRatingDistribution(
  reviews: DashboardSourceData["reviews"],
): RatingBreakdown {
  const counts: RatingBreakdown["counts"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const review of reviews) {
    const rating = review.rating as 1 | 2 | 3 | 4 | 5;
    if (rating >= 1 && rating <= 5) {
      counts[rating] += 1;
    }
  }

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return { counts, total };
}

export function computeReviewTrend(
  reviews: DashboardSourceData["reviews"],
  weeks = 8,
): ReviewTrend {
  const points: ReviewTrendPoint[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let totalInPeriod = 0;

  for (let index = weeks - 1; index >= 0; index -= 1) {
    const weekEnd = new Date(now.getTime() - index * 7 * MS_PER_DAY);
    const weekStart = new Date(weekEnd.getTime() - 7 * MS_PER_DAY);

    const count = reviews.filter((review) => {
      const created = new Date(review.createdAt).getTime();
      return created >= weekStart.getTime() && created < weekEnd.getTime();
    }).length;

    totalInPeriod += count;

    points.push({
      label: weekEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      date: weekStart.toISOString(),
      count,
    });
  }

  return { points, totalInPeriod, periodWeeks: weeks };
}

export function computeRecentActivity(
  reviews: DashboardSourceData["reviews"],
  requests: DashboardSourceData["requests"],
  limit = 10,
): DashboardActivityItem[] {
  const items: DashboardActivityItem[] = [];

  for (const review of reviews) {
    items.push({
      id: `review-${review.id}`,
      type: "review_received",
      title: `Review from ${review.reviewerName}`,
      description: `${review.rating}-star rating · ${review.title}`,
      timestamp: review.createdAt,
    });
  }

  for (const request of requests) {
    items.push({
      id: `request-created-${request.id}`,
      type: "review_request_created",
      title: "Review request sent",
      description: `Invitation sent to ${request.email}`,
      timestamp: request.createdAt,
    });

    if (request.status === "completed" && request.completedAt) {
      items.push({
        id: `request-completed-${request.id}`,
        type: "review_request_completed",
        title: "Review request completed",
        description: `${request.email} submitted a review`,
        timestamp: request.completedAt,
      });
    }

    if (request.status === "expired") {
      items.push({
        id: `request-expired-${request.id}`,
        type: "review_request_expired",
        title: "Review request expired",
        description: `Link for ${request.email} is no longer active`,
        timestamp: request.expiresAt,
      });
    }
  }

  return items
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    )
    .slice(0, limit);
}

export function mapDashboardSourceData(input: {
  averageRating: number | string | null;
  totalReviews: number | null;
  reviewRows: ReviewRow[];
  requestRows: ReviewRequestRow[];
}): DashboardSourceData {
  return {
    averageRating: Number(input.averageRating ?? 0),
    totalReviews: input.totalReviews ?? 0,
    reviews: input.reviewRows.map((row) => mapReviewRow(row)),
    requests: input.requestRows.map((row) => mapReviewRequestRow(row)),
  };
}
