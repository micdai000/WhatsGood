import type { RatingBreakdown, Review, ReviewRequest } from "@/types";

export interface PlaceholderMetric {
  tracked: false;
  label: string;
  message: string;
}

export interface ReviewGrowth {
  last30Days: number;
  previous30Days: number;
  changePercent: number | null;
}

export interface DashboardStatistics {
  averageRating: number;
  totalReviews: number;
  pendingReviewRequests: number;
  completedReviewRequests: number;
  expiredReviewRequests: number;
  totalReviewRequests: number;
  reviewRequestSuccessRate: number | null;
  reviewGrowth: ReviewGrowth;
  profileViews: PlaceholderMetric;
}

export interface ReviewTrendPoint {
  label: string;
  date: string;
  count: number;
}

export interface ReviewTrend {
  points: ReviewTrendPoint[];
  totalInPeriod: number;
  periodWeeks: number;
}

export type DashboardActivityType =
  | "review_received"
  | "review_request_created"
  | "review_request_completed"
  | "review_request_expired";

export interface DashboardActivityItem {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardProfile {
  id: string;
  displayName: string;
  username: string;
  publicProfileUrl: string;
}

export interface DashboardData {
  profile: DashboardProfile;
  statistics: DashboardStatistics;
  recentReviews: Review[];
  recentReviewRequests: ReviewRequest[];
  recentActivity: DashboardActivityItem[];
  reviewTrend: ReviewTrend;
  ratingDistribution: RatingBreakdown;
}
