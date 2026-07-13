import { createClient } from "@/lib/supabase/client";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  badgeHistoryQuerySchema,
  badgePeriodSchema,
  profileBadgeQuerySchema,
  validate,
} from "@/lib/validators";
import { failure, handleServiceError, success } from "@/services/shared";
import type { BadgeSnapshot, ProfileBadge, ServiceResult } from "@/types";
import {
  assignBadgeTiers,
  computeProfileTrustScore,
  type ScoringReview,
} from "./badge-scoring";
import {
  mapBadgeSnapshotRow,
  type BadgeSnapshotInsertRow,
  type BadgeSnapshotRow,
} from "./badge.mapper";

const REVIEW_WINDOW_DAYS = 90;
const UPSERT_BATCH_SIZE = 100;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type ProfileComputeRow = {
  id: string;
  profession_id: string | null;
  current_badge_period: string | null;
};

type ReviewComputeRow = {
  profile_id: string;
  rating: number;
  would_recommend: boolean;
  verified: boolean;
  review_request_id: string | null;
  created_at: string;
};

export function periodToComputeDate(period: string): Date {
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
}

export function currentPeriod(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function isReviewVerified(review: ReviewComputeRow): boolean {
  return review.verified || Boolean(review.review_request_id);
}

function toScoringReview(review: ReviewComputeRow): ScoringReview {
  return {
    rating: review.rating,
    wouldRecommend: review.would_recommend,
    verified: isReviewVerified(review),
    createdAt: review.created_at,
  };
}

function shouldUpdateCurrentBadge(
  computedPeriod: string,
  currentBadgePeriod: string | null,
): boolean {
  if (!currentBadgePeriod) {
    return true;
  }

  return computedPeriod >= currentBadgePeriod;
}

export class BadgeService {
  async getCurrentBadge(profileId: string): Promise<ServiceResult<ProfileBadge>> {
    const method = "BadgeService.getCurrentBadge";

    try {
      const { profileId: validatedProfileId } = validate(profileBadgeQuerySchema, {
        profileId,
      });

      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("current_badge_tier, current_badge_period")
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
        badgeTier: data.current_badge_tier ?? "none",
        badgePeriod: data.current_badge_period ?? null,
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getBadgeHistory(
    profileId: string,
    limit = 12,
  ): Promise<ServiceResult<BadgeSnapshot[]>> {
    const method = "BadgeService.getBadgeHistory";

    try {
      const { profileId: validatedProfileId, limit: validatedLimit } = validate(
        badgeHistoryQuerySchema,
        { profileId, limit },
      );

      const supabase = createClient();
      const { data, error } = await supabase
        .from("badge_snapshots")
        .select("*")
        .eq("profile_id", validatedProfileId)
        .order("period", { ascending: false })
        .limit(validatedLimit ?? 12);

      if (error) {
        logger.error(method, error, { profileId: validatedProfileId });
        return failure(DatabaseError.fromSource(error));
      }

      return success(
        (data ?? []).map((row) => mapBadgeSnapshotRow(row as BadgeSnapshotRow)),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async computeBadgesForPeriod(
    period: string,
  ): Promise<ServiceResult<{ processed: number; period: string }>> {
    const method = "BadgeService.computeBadgesForPeriod";

    try {
      const { period: validatedPeriod } = validate(badgePeriodSchema, { period });
      const computeDate = periodToComputeDate(validatedPeriod);
      const windowStart = new Date(
        computeDate.getTime() - REVIEW_WINDOW_DAYS * MS_PER_DAY,
      ).toISOString();

      const supabase = createServiceRoleClient();

      const [profilesResult, reviewsResult] = await Promise.all([
        supabase.from("profiles").select("id, profession_id, current_badge_period"),
        supabase
          .from("reviews")
          .select(
            "profile_id, rating, would_recommend, verified, review_request_id, created_at",
          )
          .gte("created_at", windowStart)
          .lte("created_at", computeDate.toISOString()),
      ]);

      if (profilesResult.error) {
        logger.error(method, profilesResult.error, { period: validatedPeriod });
        return failure(DatabaseError.fromSource(profilesResult.error));
      }

      if (reviewsResult.error) {
        logger.error(method, reviewsResult.error, { period: validatedPeriod });
        return failure(DatabaseError.fromSource(reviewsResult.error));
      }

      const profiles = (profilesResult.data ?? []) as ProfileComputeRow[];
      const reviews = (reviewsResult.data ?? []) as ReviewComputeRow[];
      const reviewsByProfile = new Map<string, ScoringReview[]>();

      for (const review of reviews) {
        const existing = reviewsByProfile.get(review.profile_id) ?? [];
        existing.push(toScoringReview(review));
        reviewsByProfile.set(review.profile_id, existing);
      }

      const professionMeans = new Map<string | null, number>();
      const profilesByProfession = new Map<string, ProfileComputeRow[]>();

      for (const profile of profiles) {
        const cohortKey = profile.profession_id ?? profile.id;
        const cohort = profilesByProfession.get(cohortKey) ?? [];
        cohort.push(profile);
        profilesByProfession.set(cohortKey, cohort);
      }

      for (const [cohortKey, cohortProfiles] of profilesByProfession) {
        const professionId = cohortProfiles[0]?.profession_id ?? null;
        const cohortProfileIds = new Set(cohortProfiles.map((profile) => profile.id));
        const professionReviews = reviews.filter((review) =>
          cohortProfileIds.has(review.profile_id),
        );

        const professionMean =
          professionReviews.length === 0
            ? 0
            : professionReviews.reduce((sum, review) => sum + review.rating, 0) /
              professionReviews.length;

        professionMeans.set(professionId, professionMean);
        professionMeans.set(cohortKey, professionMean);
      }

      const scoredProfiles = profiles.map((profile) => {
        const cohortKey = profile.profession_id ?? profile.id;
        const professionMean =
          professionMeans.get(profile.profession_id) ??
          professionMeans.get(cohortKey) ??
          0;
        const profileReviews = reviewsByProfile.get(profile.id) ?? [];
        const score = computeProfileTrustScore(
          profileReviews,
          professionMean,
          computeDate,
        );

        return {
          profile,
          cohortKey,
          trustScore: score.trustScore,
          eligible: score.eligible,
          reviewCountWindow: score.reviewCountWindow,
          componentBreakdown: score.componentBreakdown,
        };
      });

      const tierByProfileId = new Map<
        string,
        { badgeTier: BadgeSnapshot["badgeTier"]; percentile: number | null }
      >();

      for (const [, cohortProfiles] of profilesByProfession) {
        const cohortScores = cohortProfiles.map((profile) => {
          const scored = scoredProfiles.find((item) => item.profile.id === profile.id);
          return {
            profileId: profile.id,
            trustScore: scored?.trustScore ?? 0,
            eligible: scored?.eligible ?? false,
          };
        });

        const tierResults = assignBadgeTiers(cohortScores);

        for (const tierResult of tierResults) {
          tierByProfileId.set(tierResult.profileId, {
            badgeTier: tierResult.badgeTier,
            percentile: tierResult.percentile,
          });
        }
      }

      const computedAt = new Date().toISOString();
      const snapshotRows: BadgeSnapshotInsertRow[] = scoredProfiles.map((scored) => {
        const tier = tierByProfileId.get(scored.profile.id) ?? {
          badgeTier: "none" as const,
          percentile: null,
        };

        return {
          profile_id: scored.profile.id,
          period: validatedPeriod,
          trust_score: scored.trustScore,
          percentile: tier.percentile,
          badge_tier: tier.badgeTier,
          review_count_window: scored.reviewCountWindow,
          eligible: scored.eligible,
          component_breakdown: scored.componentBreakdown,
          computed_at: computedAt,
        };
      });

      for (let index = 0; index < snapshotRows.length; index += UPSERT_BATCH_SIZE) {
        const batch = snapshotRows.slice(index, index + UPSERT_BATCH_SIZE);
        const { error } = await supabase
          .from("badge_snapshots")
          .upsert(batch, { onConflict: "profile_id,period" });

        if (error) {
          logger.error(method, error, {
            period: validatedPeriod,
            batchStart: index,
          });
          return failure(DatabaseError.fromSource(error));
        }
      }

      const profilesToUpdate = scoredProfiles.filter((scored) =>
        shouldUpdateCurrentBadge(
          validatedPeriod,
          scored.profile.current_badge_period,
        ),
      );

      for (const scored of profilesToUpdate) {
        const tier = tierByProfileId.get(scored.profile.id) ?? {
          badgeTier: "none" as const,
          percentile: null,
        };

        const { error } = await supabase
          .from("profiles")
          .update({
            current_badge_tier: tier.badgeTier,
            current_badge_period: validatedPeriod,
          })
          .eq("id", scored.profile.id);

        if (error) {
          logger.error(method, error, {
            period: validatedPeriod,
            profileId: scored.profile.id,
          });
          return failure(DatabaseError.fromSource(error));
        }
      }

      logger.info(method, {
        period: validatedPeriod,
        processed: snapshotRows.length,
        profilesUpdated: profilesToUpdate.length,
      });

      return success({
        processed: snapshotRows.length,
        period: validatedPeriod,
      });
    } catch (error) {
      return handleServiceError(method, error);
    }
  }
}

export const badgeService = new BadgeService();
