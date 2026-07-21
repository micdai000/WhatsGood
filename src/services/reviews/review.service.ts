import { createClient } from "@/lib/supabase/client";
import { authService } from "@/services/auth/auth.service";
import {
  AuthorizationError,
  ConflictError,
  DatabaseError,
  NotFoundError,
} from "@/lib/errors";
import { PAGINATION } from "@/lib/constants";
import { logger } from "@/lib/logger";
import {
  createReviewSchema,
  reviewIdSchema,
  reviewsByProfileSchema,
  reviewsPaginationSchema,
  validate,
} from "@/lib/validators";
import { failure, handleServiceError, success } from "@/services/shared";
import type {
  CreateReviewInput,
  PaginatedResult,
  PaginationParams,
  RatingBreakdown,
  Review,
  ServiceResult,
} from "@/types";
import { isSuccess } from "@/types";
import {
  getVoteMonthStart,
  MONTHLY_VOTE_LIMIT_MESSAGE,
} from "@/lib/reviews/vote-limit";
import { mapReviewRow, type ReviewRow } from "./review.mapper";

export class ReviewService {
  async getReview(id: string): Promise<ServiceResult<Review>> {
    const method = "ReviewService.getReview";

    try {
      const { id: reviewId } = validate(reviewIdSchema, { id });
      const supabase = createClient();

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", reviewId)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { id: reviewId });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Review"));
      }

      return success(mapReviewRow(data as ReviewRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getReviews(
    profileId: string,
    params?: PaginationParams,
  ): Promise<ServiceResult<PaginatedResult<Review>>> {
    const method = "ReviewService.getReviews";

    try {
      const { profileId: validatedProfileId } = validate(reviewsByProfileSchema, {
        profileId,
      });
      const pagination = validate(reviewsPaginationSchema, params ?? {});
      const page = Math.max(1, pagination.page ?? PAGINATION.DEFAULT_PAGE);
      const limit = Math.min(
        Math.max(1, pagination.limit ?? PAGINATION.DEFAULT_LIMIT),
        PAGINATION.MAX_LIMIT,
      );
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const supabase = createClient();
      const { data, error, count } = await supabase
        .from("reviews")
        .select("*", { count: "exact" })
        .eq("profile_id", validatedProfileId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        logger.error(method, error, { profileId: validatedProfileId });
        return failure(DatabaseError.fromSource(error));
      }

      const total = count ?? 0;
      const items = (data ?? []).map((row) => mapReviewRow(row as ReviewRow));

      return success({
        items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async createReview(input: CreateReviewInput): Promise<ServiceResult<Review>> {
    const method = "ReviewService.createReview";

    try {
      const validated = validate(createReviewSchema, {
        ...input,
        reviewerEmail: input.reviewerEmail.trim().toLowerCase(),
        title: input.title.trim(),
        body: input.body.trim(),
        relationship: input.relationship?.trim() ? input.relationship.trim() : null,
        reviewRequestId: input.reviewRequestId ?? null,
      });

      const supabase = createClient();
      const monthStart = getVoteMonthStart().toISOString();

      const { data: existingVote, error: existingVoteError } = await supabase
        .from("reviews")
        .select("id")
        .eq("profile_id", validated.profileId)
        .eq("reviewer_email", validated.reviewerEmail)
        .gte("created_at", monthStart)
        .maybeSingle();

      if (existingVoteError) {
        logger.error(method, existingVoteError, {
          profileId: validated.profileId,
        });
        return failure(DatabaseError.fromSource(existingVoteError));
      }

      if (existingVote) {
        return failure(new ConflictError(MONTHLY_VOTE_LIMIT_MESSAGE));
      }

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          profile_id: validated.profileId,
          reviewer_name: validated.reviewerName.trim(),
          reviewer_email: validated.reviewerEmail,
          rating: validated.rating,
          title: validated.title,
          body: validated.body,
          would_recommend: validated.wouldRecommend,
          relationship: validated.relationship ?? null,
          verified: Boolean(validated.reviewRequestId),
          review_request_id: validated.reviewRequestId ?? null,
        })
        .select("*")
        .single();

      if (error) {
        logger.error(method, error, { profileId: validated.profileId });

        if (error.code === "23505") {
          return failure(new ConflictError(MONTHLY_VOTE_LIMIT_MESSAGE));
        }

        if (error.code === "23503") {
          return failure(new NotFoundError("Profile"));
        }

        return failure(DatabaseError.fromSource(error));
      }

      logger.info(method, {
        reviewId: data.id,
        profileId: validated.profileId,
        rating: validated.rating,
      });

      return success(mapReviewRow(data as ReviewRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getAverageRating(
    profileId: string,
  ): Promise<ServiceResult<{ average: number; total: number }>> {
    const method = "ReviewService.getAverageRating";

    try {
      const { profileId: validatedProfileId } = validate(reviewsByProfileSchema, {
        profileId,
      });

      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("average_rating, total_reviews")
        .eq("id", validatedProfileId)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { profileId: validatedProfileId });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Profile"));
      }

      return success({
        average: Number(data.average_rating ?? 0),
        total: data.total_reviews ?? 0,
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getRatingBreakdown(
    profileId: string,
  ): Promise<ServiceResult<RatingBreakdown>> {
    const method = "ReviewService.getRatingBreakdown";

    try {
      const { profileId: validatedProfileId } = validate(reviewsByProfileSchema, {
        profileId,
      });

      const supabase = createClient();
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("profile_id", validatedProfileId);

      if (error) {
        logger.error(method, error, { profileId: validatedProfileId });
        return failure(DatabaseError.fromSource(error));
      }

      const counts: Record<1 | 2 | 3 | 4 | 5, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      for (const row of data ?? []) {
        const rating = row.rating as 1 | 2 | 3 | 4 | 5;
        if (rating >= 1 && rating <= 5) {
          counts[rating] += 1;
        }
      }

      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

      return success({ counts, total });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async deleteReview(id: string): Promise<ServiceResult<void>> {
    const method = "ReviewService.deleteReview";

    try {
      const { id: reviewId } = validate(reviewIdSchema, { id });
      const existing = await this.getReview(reviewId);

      if (!isSuccess(existing)) {
        return failure(existing.error);
      }

      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          new AuthorizationError("You must be signed in to delete a review"),
        );
      }

      const userId = sessionResult.data.user.id;

      if (userId !== existing.data.profileId) {
        return failure(
          new AuthorizationError("You can only delete reviews on your own profile"),
        );
      }

      const supabase = createClient();
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) {
        logger.error(method, error, { id: reviewId, userId });
        return failure(DatabaseError.fromSource(error));
      }

      logger.info(method, { reviewId, profileId: existing.data.profileId });
      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }
}

export const reviewService = new ReviewService();
