import { z } from "zod";
import { REVIEW_REQUEST } from "@/lib/constants";

export const createReviewRequestSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
  email: z.string().email("Invalid email address"),
});

export const reviewRequestIdSchema = z.object({
  id: z.string().uuid("Invalid review request ID"),
});

export const reviewRequestTokenSchema = z.object({
  token: z.string().uuid("Invalid review request token"),
});

export const updateReviewRequestStatusSchema = z.object({
  status: z.enum(REVIEW_REQUEST.STATUSES),
});

export type CreateReviewRequestSchema = z.infer<typeof createReviewRequestSchema>;
