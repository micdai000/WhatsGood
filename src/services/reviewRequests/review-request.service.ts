import "server-only";

import { createClient } from "@/lib/supabase/server";
import { authService } from "@/services/auth/auth.service";
import {
  ApplicationError,
  AuthorizationError,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { PAGINATION, REVIEW_REQUEST } from "@/lib/constants";
import { logger } from "@/lib/logger";
import {
  createReviewRequestSchema,
  reviewRequestIdSchema,
  reviewRequestTokenSchema,
  reviewsPaginationSchema,
  validate,
} from "@/lib/validators";
import { failure, handleServiceError, success } from "@/services/shared";
import type {
  CreateReviewRequestInput,
  PaginatedResult,
  PaginationParams,
  ReviewRequest,
  ServiceResult,
} from "@/types";
import { isSuccess } from "@/types";
import {
  mapReviewRequestRow,
  mapReviewRequestWithProfileRow,
  type ReviewRequestRow,
  type ReviewRequestWithProfileRow,
} from "./review-request.mapper";

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

function computeExpiresAt(): string {
  const expires = new Date();
  expires.setDate(expires.getDate() + REVIEW_REQUEST.TOKEN_EXPIRY_DAYS);
  return expires.toISOString();
}

export class ReviewRequestService {
  async getRequest(id: string): Promise<ServiceResult<ReviewRequest>> {
    const method = "ReviewRequestService.getRequest";

    try {
      const { id: requestId } = validate(reviewRequestIdSchema, { id });
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("review_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { id: requestId });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Review request"));
      }

      return success(mapReviewRequestRow(data as ReviewRequestRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getRequestByToken(
    token: string,
  ): Promise<
    ServiceResult<
      ReviewRequest & { profileUsername: string; profileDisplayName: string }
    >
  > {
    const method = "ReviewRequestService.getRequestByToken";

    try {
      const { token: requestToken } = validate(reviewRequestTokenSchema, { token });
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("review_requests")
        .select(
          `
          *,
          profiles ( username, display_name )
        `,
        )
        .eq("token", requestToken)
        .maybeSingle();

      if (error) {
        logger.error(method, error, { token: requestToken });
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Review request"));
      }

      const request = mapReviewRequestWithProfileRow(
        data as ReviewRequestWithProfileRow,
      );

      if (request.status === "pending" && isExpired(request.expiresAt)) {
        return failure(
          new ApplicationError(
            "This review link has expired",
            "EXPIRED",
            410,
          ),
        );
      }

      if (request.status === "expired") {
        return failure(
          new ApplicationError(
            "This review link has expired",
            "EXPIRED",
            410,
          ),
        );
      }

      if (request.status === "completed") {
        return failure(
          new ApplicationError(
            "This review has already been submitted",
            "ALREADY_COMPLETED",
            409,
          ),
        );
      }

      return success(request);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getRequestsForProfile(
    profileId: string,
    params?: PaginationParams,
  ): Promise<ServiceResult<PaginatedResult<ReviewRequest>>> {
    const method = "ReviewRequestService.getRequestsForProfile";

    try {
      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(new AuthorizationError("You must be signed in"));
      }

      if (sessionResult.data.user.id !== profileId) {
        return failure(
          new AuthorizationError("You can only view your own review requests"),
        );
      }

      const pagination = validate(reviewsPaginationSchema, params ?? {});
      const page = Math.max(1, pagination.page ?? PAGINATION.DEFAULT_PAGE);
      const limit = Math.min(
        Math.max(1, pagination.limit ?? PAGINATION.DEFAULT_LIMIT),
        PAGINATION.MAX_LIMIT,
      );
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const supabase = await createClient();
      const { data, error, count } = await supabase
        .from("review_requests")
        .select("*", { count: "exact" })
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        logger.error(method, error, { profileId });
        return failure(DatabaseError.fromSource(error));
      }

      const total = count ?? 0;
      const items = (data ?? []).map((row) =>
        mapReviewRequestRow(row as ReviewRequestRow),
      );

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

  /** @deprecated Use getRequestsForProfile */
  async getRequestsByProfile(
    profileId: string,
    params?: PaginationParams,
  ): Promise<ServiceResult<PaginatedResult<ReviewRequest>>> {
    return this.getRequestsForProfile(profileId, params);
  }

  async createRequest(
    input: CreateReviewRequestInput,
  ): Promise<ServiceResult<ReviewRequest>> {
    const method = "ReviewRequestService.createRequest";

    try {
      const validated = validate(createReviewRequestSchema, {
        ...input,
        email: input.email.trim().toLowerCase(),
      });

      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(new AuthorizationError("You must be signed in"));
      }

      if (sessionResult.data.user.id !== validated.profileId) {
        return failure(
          new AuthorizationError("You can only create requests for your own profile"),
        );
      }

      const supabase = await createClient();
      const expiresAt = computeExpiresAt();

      const { data, error } = await supabase
        .from("review_requests")
        .insert({
          profile_id: validated.profileId,
          email: validated.email,
          expires_at: expiresAt,
          status: "pending",
        })
        .select("*")
        .single();

      if (error) {
        logger.error(method, error, { profileId: validated.profileId });
        return failure(DatabaseError.fromSource(error));
      }

      logger.info(method, {
        requestId: data.id,
        profileId: validated.profileId,
        expiresAt,
      });

      return success(mapReviewRequestRow(data as ReviewRequestRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async completeRequest(token: string): Promise<ServiceResult<ReviewRequest>> {
    const method = "ReviewRequestService.completeRequest";

    try {
      const { token: requestToken } = validate(reviewRequestTokenSchema, { token });
      const supabase = await createClient();

      const { data, error } = await supabase.rpc("complete_review_request", {
        p_token: requestToken,
      });

      if (error) {
        logger.error(method, error, { token: requestToken });

        if (error.message.includes("expired") || error.code === "P0001") {
          return failure(
            new ApplicationError(
              "This review link has expired",
              "EXPIRED",
              410,
            ),
          );
        }

        if (error.message.includes("not found") || error.code === "P0002") {
          return failure(new NotFoundError("Review request"));
        }

        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new NotFoundError("Review request"));
      }

      logger.info(method, { requestId: data.id, token: requestToken });
      return success(mapReviewRequestRow(data as ReviewRequestRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async expireRequest(id: string): Promise<ServiceResult<ReviewRequest>> {
    const method = "ReviewRequestService.expireRequest";

    try {
      const { id: requestId } = validate(reviewRequestIdSchema, { id });
      const existing = await this.getRequest(requestId);

      if (!isSuccess(existing)) {
        return failure(existing.error);
      }

      const sessionResult = await authService.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(new AuthorizationError("You must be signed in"));
      }

      if (sessionResult.data.user.id !== existing.data.profileId) {
        return failure(
          new AuthorizationError("You can only expire your own review requests"),
        );
      }

      if (existing.data.status === "completed") {
        return failure(
          new ValidationError("Completed review requests cannot be expired"),
        );
      }

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("review_requests")
        .update({ status: "expired" })
        .eq("id", requestId)
        .select("*")
        .single();

      if (error) {
        logger.error(method, error, { id: requestId });
        return failure(DatabaseError.fromSource(error));
      }

      logger.info(method, { requestId });
      return success(mapReviewRequestRow(data as ReviewRequestRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async resendRequest(id: string): Promise<ServiceResult<ReviewRequest>> {
    const method = "ReviewRequestService.resendRequest";

    try {
      const existing = await this.getRequest(id);

      if (!isSuccess(existing)) {
        return failure(existing.error);
      }

      return this.createRequest({
        profileId: existing.data.profileId,
        email: existing.data.email,
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }
}

export const reviewRequestService = new ReviewRequestService();
