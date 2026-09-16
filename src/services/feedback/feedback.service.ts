import { createClient } from "@/lib/supabase/client";
import { DatabaseError, ValidationError } from "@/lib/errors";
import { PAGINATION } from "@/lib/constants";
import { logger } from "@/lib/logger";
import {
  feedbackQuerySchema,
  submitFeedbackSchema,
  validate,
} from "@/lib/validators";
import { failure, handleServiceError, success } from "@/services/shared";
import type {
  PaginatedResult,
  PaginationParams,
  ReputationFeedback,
  ServiceResult,
  SubmitFeedbackInput,
} from "@/types";
import { mapFeedbackRow, type FeedbackRow } from "./feedback.mapper";

export class FeedbackService {
  async submitFeedback(
    input: SubmitFeedbackInput,
  ): Promise<ServiceResult<ReputationFeedback>> {
    const method = "FeedbackService.submitFeedback";

    try {
      const validated = validate(submitFeedbackSchema, input);
      const supabase = createClient();
      const { data, error } = await supabase.rpc("submit_reputation_feedback", {
        p_business_id: validated.businessId,
        p_location_id: validated.locationId ?? null,
        p_qr_code_id: validated.qrCodeId ?? null,
        p_would_recommend: validated.wouldRecommend ?? null,
        p_experience_type: validated.experienceType?.trim()
          ? validated.experienceType.trim()
          : null,
        p_feedback_data: validated.feedbackData ?? {},
      });

      if (error) {
        logger.error(method, error, { businessId: validated.businessId });
        if (error.code === "22023") {
          return failure(
            new ValidationError(
              error.message || "This feedback could not be submitted.",
            ),
          );
        }
        return failure(DatabaseError.fromSource(error));
      }

      if (!data) {
        return failure(new DatabaseError());
      }

      return success(mapFeedbackRow(data as FeedbackRow));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getFeedbackForBusiness(
    businessId: string,
    params?: PaginationParams,
  ): Promise<ServiceResult<PaginatedResult<ReputationFeedback>>> {
    const method = "FeedbackService.getFeedbackForBusiness";

    try {
      const validated = validate(feedbackQuerySchema, {
        businessId,
        ...params,
      });
      const page = Math.max(1, validated.page ?? PAGINATION.DEFAULT_PAGE);
      const limit = Math.min(
        Math.max(1, validated.limit ?? PAGINATION.DEFAULT_LIMIT),
        PAGINATION.MAX_LIMIT,
      );
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const supabase = createClient();
      const { data, error, count } = await supabase
        .from("reputation_feedback")
        .select("*", { count: "exact" })
        .eq("business_id", validated.businessId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        logger.error(method, error, { businessId: validated.businessId });
        return failure(DatabaseError.fromSource(error));
      }

      const total = count ?? 0;

      return success({
        items: (data ?? []).map((row) => mapFeedbackRow(row as FeedbackRow)),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getFeedbackSummary(
    businessId: string,
  ): Promise<
    ServiceResult<{ total: number; verified: number; recentCount: number }>
  > {
    const method = "FeedbackService.getFeedbackSummary";

    try {
      const validated = validate(feedbackQuerySchema, { businessId });
      const supabase = createClient();
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const [totalResult, verifiedResult, recentResult] = await Promise.all([
        supabase
          .from("reputation_feedback")
          .select("id", { count: "exact", head: true })
          .eq("business_id", validated.businessId),
        supabase
          .from("reputation_feedback")
          .select("id", { count: "exact", head: true })
          .eq("business_id", validated.businessId)
          .eq("verified", true),
        supabase
          .from("reputation_feedback")
          .select("id", { count: "exact", head: true })
          .eq("business_id", validated.businessId)
          .gte("created_at", since.toISOString()),
      ]);

      if (totalResult.error) {
        logger.error(method, totalResult.error, {
          businessId: validated.businessId,
        });
        return failure(DatabaseError.fromSource(totalResult.error));
      }

      if (verifiedResult.error) {
        logger.error(method, verifiedResult.error, {
          businessId: validated.businessId,
        });
        return failure(DatabaseError.fromSource(verifiedResult.error));
      }

      if (recentResult.error) {
        logger.error(method, recentResult.error, {
          businessId: validated.businessId,
        });
        return failure(DatabaseError.fromSource(recentResult.error));
      }

      return success({
        total: totalResult.count ?? 0,
        verified: verifiedResult.count ?? 0,
        recentCount: recentResult.count ?? 0,
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }
}

export const feedbackService = new FeedbackService();
