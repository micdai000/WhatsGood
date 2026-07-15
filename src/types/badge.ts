import type { BADGE_TIERS } from "@/lib/constants/badges";

export type BadgeTier = (typeof BADGE_TIERS)[number];

export interface ComponentBreakdown {
  bayesian_avg: number;
  wilson_recommend: number;
  verified_ratio: number;
  review_count_window: number;
}

export interface BadgeSnapshot {
  id: string;
  profileId: string;
  period: string;
  trustScore: number;
  percentile: number | null;
  badgeTier: BadgeTier;
  reviewCountWindow: number;
  eligible: boolean;
  componentBreakdown: ComponentBreakdown;
  computedAt: string;
}

export interface ProfileBadge {
  badgeTier: BadgeTier;
  badgePeriod: string | null;
}
