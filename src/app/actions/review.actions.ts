"use server";

import { revalidatePath } from "next/cache";
import { ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { reviewService } from "@/services/reviews/review.service";
import { reviewRequestService } from "@/services/reviewRequests/review-request.service";
import { profileService } from "@/services/profiles/profile.service";
import { leaveReviewSchema, validate } from "@/lib/validators";
import { isFailure } from "@/types";
import type { Review } from "@/types";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; message: string; code: string; fieldErrors?: Record<string, string[]> };

function mapServiceFailure<T>(result: {
  error: { message: string; code: string; fieldErrors?: Record<string, string[]> };
}): ActionResult<T> {
  return {
    success: false,
    message: result.error.message,
    code: result.error.code,
    fieldErrors: result.error.fieldErrors,
  };
}

export async function createReviewAction(
  input: unknown,
): Promise<ActionResult<Review>> {
  try {
    const validated = validate(leaveReviewSchema, input);
    const reviewerEmail = validated.reviewerEmail.trim().toLowerCase();

    let profileId: string;
    let slug: string;
    let reviewRequestId: string | null = null;
    let requestToken: string | null = null;

    if (validated.requestToken) {
      requestToken = validated.requestToken;
      const requestResult = await reviewRequestService.getRequestByToken(
        validated.requestToken,
      );

      if (isFailure(requestResult)) {
        return mapServiceFailure(requestResult);
      }

      const request = requestResult.data;

      if (reviewerEmail !== request.email.toLowerCase()) {
        return {
          success: false,
          message: "This review link was sent to a different email address.",
          code: "EMAIL_MISMATCH",
        };
      }

      profileId = request.profileId;
      slug = request.profileUsername;
      reviewRequestId = request.id;
    } else if (validated.slug) {
      const profileResult = await profileService.getProfileBySlug(validated.slug);

      if (isFailure(profileResult)) {
        return mapServiceFailure(profileResult);
      }

      profileId = profileResult.data.id;
      slug = validated.slug;
    } else {
      return {
        success: false,
        message: "A profile or review link is required.",
        code: "VALIDATION_ERROR",
      };
    }

    const result = await reviewService.createReview({
      profileId,
      reviewerName: validated.reviewerName,
      reviewerEmail,
      rating: validated.rating,
      title: validated.title,
      body: validated.body,
      wouldRecommend: validated.wouldRecommend,
      relationship: validated.relationship,
      reviewRequestId,
    });

    if (isFailure(result)) {
      return mapServiceFailure(result);
    }

    if (requestToken) {
      const completeResult = await reviewRequestService.completeRequest(requestToken);

      if (isFailure(completeResult)) {
        logger.warn("Review created but request completion failed", {
          error: completeResult.error.message,
        });
      }

      revalidatePath(`/review/request/${requestToken}`);
      revalidatePath("/dashboard/review-requests");
    }

    revalidatePath(`/u/${slug}`);
    revalidatePath(`/@${slug}`);
    revalidatePath(`/review/${slug}`);
    revalidatePath("/dashboard");

    return { success: true, data: result.data };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        message: error.message,
        code: error.code,
        fieldErrors: error.details as Record<string, string[]> | undefined,
      };
    }

    return {
      success: false,
      message: "Something went wrong. Please try again.",
      code: "INTERNAL_ERROR",
    };
  }
}

export async function deleteReviewAction(
  reviewId: string,
  slug: string,
): Promise<ActionResult> {
  const result = await reviewService.deleteReview(reviewId);

  if (isFailure(result)) {
    return mapServiceFailure(result);
  }

  revalidatePath(`/u/${slug}`);
  revalidatePath(`/@${slug}`);
  revalidatePath("/dashboard");

  return { success: true, data: undefined };
}
