export const REPUTATION_TIERS = [
  "building",
  "bronze",
  "silver",
  "gold",
  "elite",
] as const;

export type ReputationTier = (typeof REPUTATION_TIERS)[number];

export interface ReputationSnapshot {
  id: string;
  businessId: string;
  locationId: string | null;
  period: string;
  reputationScore: number | null;
  reputationTier: ReputationTier;
  feedbackCount: number;
  verifiedFeedbackCount: number;
  eligible: boolean;
  componentBreakdown: Record<string, unknown>;
  computedAt: string;
}
