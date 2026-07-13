import { ValidationError } from "@/lib/errors";
import { authService } from "@/services/auth/auth.service";
import { reviewRequestService } from "@/services/reviewRequests/review-request.service";
import { getReviewRequestUrl } from "@/lib/review-request/public-url";
import { z } from "zod";
import { validate } from "@/lib/validators";
import { isFailure, isSuccess } from "@/types";
import type { ReviewRequest } from "@/types";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; message: string; code: string; fieldErrors?: Record<string, string[]> };

const createReviewRequestEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

function mapServiceFailure<T>(result: {
  error: { message: string; code: string };
}): ActionResult<T> {
  return {
    success: false,
    message: result.error.message,
    code: result.error.code,
  };
}

export async function createReviewRequestAction(
  input: unknown,
): Promise<ActionResult<{ request: ReviewRequest; shareUrl: string }>> {
  try {
    const sessionResult = await authService.getSession();

    if (!isSuccess(sessionResult) || !sessionResult.data) {
      return {
        success: false,
        message: "You must be signed in to request a review.",
        code: "UNAUTHORIZED",
      };
    }

    const { email } = validate(createReviewRequestEmailSchema, input);
    const profileId = sessionResult.data.user.id;

    const result = await reviewRequestService.createRequest({
      profileId,
      email,
    });

    if (isFailure(result)) {
      return mapServiceFailure(result);
    }

    return {
      success: true,
      data: {
        request: result.data,
        shareUrl: getReviewRequestUrl(result.data.token),
      },
    };
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

export async function expireReviewRequestAction(
  requestId: string,
): Promise<ActionResult<ReviewRequest>> {
  const result = await reviewRequestService.expireRequest(requestId);

  if (isFailure(result)) {
    return mapServiceFailure(result);
  }

  return { success: true, data: result.data };
}

export async function getReviewRequestsAction(page = 1, limit = 20) {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    return {
      success: false as const,
      message: "You must be signed in.",
      code: "UNAUTHORIZED",
    };
  }

  return reviewRequestService.getRequestsForProfile(
    sessionResult.data.user.id,
    { page, limit },
  );
}
