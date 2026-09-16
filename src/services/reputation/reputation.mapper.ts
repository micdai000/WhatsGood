import type { ReputationSnapshot } from "@/types";
import { REPUTATION_TIERS, type ReputationTier } from "@/types/reputation";

export type ReputationSnapshotRow = {
  id: string;
  business_id: string;
  location_id: string | null;
  period: string;
  reputation_score: number | string | null;
  reputation_tier: string;
  feedback_count: number;
  verified_feedback_count: number;
  eligible: boolean;
  component_breakdown: Record<string, unknown> | null;
  computed_at: string;
};

function asReputationTier(value: string): ReputationTier {
  return (REPUTATION_TIERS as readonly string[]).includes(value)
    ? (value as ReputationTier)
    : "building";
}

export function mapReputationSnapshotRow(
  row: ReputationSnapshotRow,
): ReputationSnapshot {
  return {
    id: row.id,
    businessId: row.business_id,
    locationId: row.location_id,
    period: row.period,
    reputationScore:
      row.reputation_score === null ? null : Number(row.reputation_score),
    reputationTier: asReputationTier(row.reputation_tier),
    feedbackCount: row.feedback_count,
    verifiedFeedbackCount: row.verified_feedback_count,
    eligible: row.eligible,
    componentBreakdown: row.component_breakdown ?? {},
    computedAt: row.computed_at,
  };
}
