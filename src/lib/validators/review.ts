import { z } from "zod";
import { LIMITS, RATING } from "@/lib/constants";
import { profileSlugSchema } from "./profile";

const reviewerNameSchema = z
  .string()
  .min(1, "Your name is required")
  .max(LIMITS.FULL_NAME_MAX_LENGTH);

const reviewerEmailSchema = z.string().email("Invalid email address");

const ratingSchema = z
  .number()
  .int()
  .min(RATING.MIN, `Rating must be at least ${RATING.MIN}`)
  .max(RATING.MAX, `Rating must be at most ${RATING.MAX}`);

const titleSchema = z
  .string()
  .min(1, "Review title is required")
  .max(LIMITS.REVIEW_TITLE_MAX_LENGTH);

const bodySchema = z
  .string()
  .min(LIMITS.REVIEW_BODY_MIN_LENGTH, `Review must be at least ${LIMITS.REVIEW_BODY_MIN_LENGTH} characters`)
  .max(LIMITS.REVIEW_TEXT_MAX_LENGTH);

const relationshipSchema = z
  .string()
  .max(LIMITS.RELATIONSHIP_MAX_LENGTH)
  .nullable()
  .optional();

export const createReviewSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
  reviewerName: reviewerNameSchema,
  reviewerEmail: reviewerEmailSchema,
  rating: ratingSchema,
  title: titleSchema,
  body: bodySchema,
  wouldRecommend: z.boolean(),
  relationship: relationshipSchema,
  reviewRequestId: z.string().uuid().optional().nullable(),
});

export const leaveReviewSchema = z
  .object({
    slug: profileSlugSchema.shape.slug.optional(),
    requestToken: z.string().uuid("Invalid review request token").optional(),
    reviewerName: reviewerNameSchema,
    reviewerEmail: reviewerEmailSchema,
    rating: ratingSchema,
    title: titleSchema,
    body: bodySchema,
    wouldRecommend: z.boolean(),
    relationship: relationshipSchema,
  })
  .refine((data) => Boolean(data.slug || data.requestToken), {
    message: "A profile slug or review request token is required",
    path: ["slug"],
  });

export const reviewIdSchema = z.object({
  id: z.string().uuid("Invalid review ID"),
});

export const reviewsByProfileSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
});

export const reviewsByProfileSlugSchema = z.object({
  slug: profileSlugSchema.shape.slug,
});

export const reviewsPaginationSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type CreateReviewSchema = z.infer<typeof createReviewSchema>;
export type LeaveReviewSchema = z.infer<typeof leaveReviewSchema>;
