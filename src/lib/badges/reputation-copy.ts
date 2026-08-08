import { formatBadgePeriod } from "@/lib/badges/display";

/** Client-facing recency window (matches badge scoring). */
export const REPUTATION_RECENCY_WINDOW = "last 90 days";

export const REPUTATION_HISTORY_MONTHS = 12;

export const REPUTATION_HISTORY_LABEL = "12-month reputation history";

export const CURRENT_REPUTATION_LABEL = "Current reputation";

export const CURRENT_TIER_LABEL = "Current tier";

export const REPUTATION_NOW_TAGLINE =
  "Shows how clients feel about this professional now — not years ago.";

export const HOW_BADGE_WORKS_HEADING = "How this badge works";

/** Primary customer-facing explanation (Step 4). */
export const HOW_BADGE_WORKS_SUMMARY =
  "Tiers are recalculated monthly using recent client feedback. Older feedback gradually carries less weight, so your reputation reflects recent performance rather than your entire history.";

export const REPUTATION_HISTORY_SECTION_ID = "reputation-history";

export function currentBadgePeriod(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function formatVerifiedExperienceCount(count: number): string {
  if (count === 1) {
    return "1 verified client experience";
  }

  return `${count} verified client experiences`;
}

export function formatReputationUpdatedLabel(badgePeriod: string | null): string {
  if (!badgePeriod) {
    return "Not updated this month yet";
  }

  if (badgePeriod === currentBadgePeriod()) {
    return "Updated this month";
  }

  return `Updated ${formatBadgePeriod(badgePeriod)}`;
}
