import { createClient } from "@/lib/supabase/client";
import { authService } from "@/services/auth/auth.service";
import {
  AuthorizationError,
  DatabaseError,
  NotFoundError,
} from "@/lib/errors";
import { getPublicProfileUrl } from "@/lib/profile/public-url";
import { logger } from "@/lib/logger";
import {
  dashboardProfileIdSchema,
  dashboardTrendWeeksSchema,
  validate,
} from "@/lib/validators";
import { failure, handleServiceError, success } from "@/services/shared";
import type { ReviewRequestRow } from "@/services/reviewRequests/review-request.mapper";
import type { ReviewRow } from "@/services/reviews/review.mapper";
import type {
  DashboardActivityItem,
  DashboardData,
  DashboardStatistics,
  RatingBreakdown,
  ReviewTrend,
  ServiceResult,
} from "@/types";
import { isSuccess } from "@/types";
import {
  computeRatingDistribution,
  computeRecentActivity,
  computeReviewTrend,
  computeStatistics,
  mapDashboardSourceData,
  type DashboardSourceData,
} from "./dashboard.analytics";

const RECENT_REVIEWS_LIMIT = 5;
const RECENT_REQUESTS_LIMIT = 5;
const ACTIVITY_LIMIT = 10;

export class DashboardService {
  private async assertProfileAccess(
    profileId: string,
  ): Promise<ServiceResult<void>> {
    const sessionResult = await authService.getSession();

    if (!isSuccess(sessionResult) || !sessionResult.data) {
      return failure(new AuthorizationError("You must be signed in"));
    }

    if (sessionResult.data.user.id !== profileId) {
      return failure(
        new AuthorizationError("You can only view your own dashboard"),
      );
    }

    return success(undefined);
  }

  private async fetchSourceData(
    profileId: string,
  ): Promise<
    ServiceResult<DashboardSourceData & { displayName: string; username: string }>
  > {
    const method = "DashboardService.fetchSourceData";

    try {
      const access = await this.assertProfileAccess(profileId);
      if (!isSuccess(access)) {
        return failure(access.error);
      }

      const { id: validatedProfileId } = validate(dashboardProfileIdSchema, {
        id: profileId,
      });

      const supabase = createClient();

      const [profileResult, reviewsResult, requestsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, display_name, average_rating, total_reviews")
          .eq("id", validatedProfileId)
          .maybeSingle(),
        supabase
          .from("reviews")
          .select("*")
          .eq("profile_id", validatedProfileId)
          .order("created_at", { ascending: false }),
        supabase
          .from("review_requests")
          .select("*")
          .eq("profile_id", validatedProfileId)
          .order("created_at", { ascending: false }),
      ]);

      if (profileResult.error) {
        logger.error(method, profileResult.error, { profileId: validatedProfileId });
        return failure(DatabaseError.fromSource(profileResult.error));
      }

      if (!profileResult.data) {
        return failure(new NotFoundError("Profile"));
      }

      if (reviewsResult.error) {
        logger.error(method, reviewsResult.error, { profileId: validatedProfileId });
        return failure(DatabaseError.fromSource(reviewsResult.error));
      }

      if (requestsResult.error) {
        logger.error(method, requestsResult.error, { profileId: validatedProfileId });
        return failure(DatabaseError.fromSource(requestsResult.error));
      }

      const source = mapDashboardSourceData({
        averageRating: profileResult.data.average_rating,
        totalReviews: profileResult.data.total_reviews,
        reviewRows: (reviewsResult.data ?? []) as ReviewRow[],
        requestRows: (requestsResult.data ?? []) as ReviewRequestRow[],
      });

      return success({
        ...source,
        displayName: profileResult.data.display_name,
        username: profileResult.data.username,
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getStatistics(
    profileId: string,
  ): Promise<ServiceResult<DashboardStatistics>> {
    const method = "DashboardService.getStatistics";

    try {
      const sourceResult = await this.fetchSourceData(profileId);
      if (!isSuccess(sourceResult)) {
        return failure(sourceResult.error);
      }

      return success(computeStatistics(sourceResult.data));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getRecentActivity(
    profileId: string,
    limit = ACTIVITY_LIMIT,
  ): Promise<ServiceResult<DashboardActivityItem[]>> {
    const method = "DashboardService.getRecentActivity";

    try {
      const sourceResult = await this.fetchSourceData(profileId);
      if (!isSuccess(sourceResult)) {
        return failure(sourceResult.error);
      }

      return success(
        computeRecentActivity(
          sourceResult.data.reviews,
          sourceResult.data.requests,
          limit,
        ),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getReviewTrend(
    profileId: string,
    weeks = 8,
  ): Promise<ServiceResult<ReviewTrend>> {
    const method = "DashboardService.getReviewTrend";

    try {
      const { weeks: validatedWeeks } = validate(dashboardTrendWeeksSchema, {
        weeks,
      });
      const sourceResult = await this.fetchSourceData(profileId);
      if (!isSuccess(sourceResult)) {
        return failure(sourceResult.error);
      }

      return success(
        computeReviewTrend(sourceResult.data.reviews, validatedWeeks),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getRatingDistribution(
    profileId: string,
  ): Promise<ServiceResult<RatingBreakdown>> {
    const method = "DashboardService.getRatingDistribution";

    try {
      const sourceResult = await this.fetchSourceData(profileId);
      if (!isSuccess(sourceResult)) {
        return failure(sourceResult.error);
      }

      return success(computeRatingDistribution(sourceResult.data.reviews));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getDashboard(profileId: string): Promise<ServiceResult<DashboardData>> {
    const method = "DashboardService.getDashboard";

    try {
      const sourceResult = await this.fetchSourceData(profileId);
      if (!isSuccess(sourceResult)) {
        return failure(sourceResult.error);
      }

      const { displayName, username, reviews, requests } = sourceResult.data;

      const statistics = computeStatistics(sourceResult.data);
      const reviewTrend = computeReviewTrend(reviews);
      const ratingDistribution = computeRatingDistribution(reviews);
      const recentActivity = computeRecentActivity(reviews, requests, ACTIVITY_LIMIT);

      logger.info(method, {
        profileId,
        totalReviews: statistics.totalReviews,
        totalReviewRequests: statistics.totalReviewRequests,
      });

      return success({
        profile: {
          id: profileId,
          displayName,
          username,
          publicProfileUrl: getPublicProfileUrl(username),
        },
        statistics,
        recentReviews: reviews.slice(0, RECENT_REVIEWS_LIMIT),
        recentReviewRequests: requests.slice(0, RECENT_REQUESTS_LIMIT),
        recentActivity,
        reviewTrend,
        ratingDistribution,
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }
}

export const dashboardService = new DashboardService();
