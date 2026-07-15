import { z } from "zod";
import { BADGE_TIERS } from "@/lib/constants/badges";

const periodSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Period must be in YYYY-MM format");

const badgeTierSchema = z.enum(BADGE_TIERS);

const componentBreakdownSchema = z.object({
  bayesian_avg: z.number(),
  wilson_recommend: z.number().min(0).max(1),
  verified_ratio: z.number().min(0).max(1),
  review_count_window: z.number().int().min(0),
});

export const badgeSnapshotSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  period: periodSchema,
  trust_score: z.number().min(0).max(100),
  percentile: z.number().min(0).max(100).nullable(),
  badge_tier: badgeTierSchema,
  review_count_window: z.number().int().min(0),
  eligible: z.boolean(),
  component_breakdown: componentBreakdownSchema,
  computed_at: z.string().datetime(),
});

export const profileBadgeQuerySchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
});

export const badgePeriodSchema = z.object({
  period: periodSchema,
});

export const badgeHistoryQuerySchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
  limit: z.number().int().min(1).max(24).optional(),
});

export type BadgeSnapshotSchema = z.infer<typeof badgeSnapshotSchema>;
export type ProfileBadgeQuerySchema = z.infer<typeof profileBadgeQuerySchema>;
