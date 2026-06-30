import { z } from "zod";
import { LIMITS, RATING } from "@/lib/constants";

export const createReviewSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
  reviewerName: z
    .string()
    .min(1, "Reviewer name is required")
    .max(LIMITS.FULL_NAME_MAX_LENGTH),
  reviewerEmail: z.string().email("Invalid email address"),
  rating: z
    .number()
    .int()
    .min(RATING.MIN, `Rating must be at least ${RATING.MIN}`)
    .max(RATING.MAX, `Rating must be at most ${RATING.MAX}`),
  reviewText: z
    .string()
    .max(LIMITS.REVIEW_TEXT_MAX_LENGTH)
    .nullable()
    .optional(),
  serviceDescription: z
    .string()
    .max(LIMITS.SERVICE_DESCRIPTION_MAX_LENGTH)
    .nullable()
    .optional(),
  reviewRequestToken: z.string().uuid().optional(),
});

export const reviewIdSchema = z.object({
  id: z.string().uuid("Invalid review ID"),
});

export const reviewsByProfileSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
});

export type CreateReviewSchema = z.infer<typeof createReviewSchema>;
