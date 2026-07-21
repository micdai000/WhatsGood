import type { BadgeSnapshot, BadgeSubTier, BadgeTier, ComponentBreakdown } from "@/types/badge";

export type BadgeSnapshotRow = {
  id: string;
  profile_id: string;
  period: string;
  trust_score: number | string;
  percentile: number | string | null;
  badge_tier: BadgeTier;
  badge_sub_tier: number | null;
  review_count_window: number;
  eligible: boolean;
  component_breakdown: ComponentBreakdown | Record<string, unknown>;
  computed_at: string;
};

export function mapComponentBreakdown(
  value: ComponentBreakdown | Record<string, unknown>,
): ComponentBreakdown {
  const raw = value as Record<string, number>;

  return {
    bayesian_avg: Number(raw.bayesian_avg ?? 0),
    wilson_recommend: Number(raw.wilson_recommend ?? 0),
    verified_ratio: Number(raw.verified_ratio ?? 0),
    review_count_window: Number(raw.review_count_window ?? 0),
  };
}

function mapBadgeSubTier(value: number | null | undefined): BadgeSubTier | null {
  if (value === 1 || value === 2 || value === 3) {
    return value;
  }

  return null;
}

export function mapBadgeSnapshotRow(row: BadgeSnapshotRow): BadgeSnapshot {
  return {
    id: row.id,
    profileId: row.profile_id,
    period: row.period,
    trustScore: Number(row.trust_score),
    percentile: row.percentile === null ? null : Number(row.percentile),
    badgeTier: row.badge_tier,
    badgeSubTier: mapBadgeSubTier(row.badge_sub_tier),
    reviewCountWindow: row.review_count_window,
    eligible: row.eligible,
    componentBreakdown: mapComponentBreakdown(row.component_breakdown),
    computedAt: row.computed_at,
  };
}

export type BadgeSnapshotInsertRow = {
  profile_id: string;
  period: string;
  trust_score: number;
  percentile: number | null;
  badge_tier: BadgeTier;
  badge_sub_tier: BadgeSubTier | null;
  review_count_window: number;
  eligible: boolean;
  component_breakdown: ComponentBreakdown;
  computed_at: string;
};
