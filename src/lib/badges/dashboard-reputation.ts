import { BADGE_TIER_LABELS } from "@/lib/badges/display";
import {
  FIXED_THRESHOLD_FALLBACK,
  MIN_REVIEWS_FOR_ELIGIBILITY,
} from "@/lib/constants/badges";
import type { BadgeSnapshot, BadgeTier } from "@/types/badge";
import type { DashboardReputationSummary } from "@/types/dashboard";

const TIER_RANK: Record<BadgeTier, number> = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  elite: 5,
};

const TIER_ASCENDING: BadgeTier[] = [
  "none",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "elite",
];

function previousCalendarMonth(period: string): string | null {
  const [year, month] = period.split("-").map(Number);
  if (!year || !month) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, 1));
  date.setUTCMonth(date.getUTCMonth() - 1);
  const prevYear = date.getUTCFullYear();
  const prevMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${prevYear}-${prevMonth}`;
}

export function getNextBadgeTier(tier: BadgeTier): BadgeTier | null {
  const index = TIER_ASCENDING.indexOf(tier);
  if (index < 0 || index >= TIER_ASCENDING.length - 1) {
    return null;
  }

  return TIER_ASCENDING[index + 1];
}

export function computeConsecutiveActiveMonths(
  history: BadgeSnapshot[],
): number {
  if (history.length === 0) {
    return 0;
  }

  const sorted = [...history].sort((left, right) =>
    right.period.localeCompare(left.period),
  );

  let count = 0;
  let expectedPeriod: string | null = sorted[0]?.period ?? null;

  for (const snapshot of sorted) {
    if (!expectedPeriod || snapshot.period !== expectedPeriod) {
      break;
    }

    if (!snapshot.eligible || snapshot.badgeTier === "none") {
      break;
    }

    count += 1;
    expectedPeriod = previousCalendarMonth(snapshot.period);
  }

  return count;
}

export function formatTierMovementMessage(
  currentTier: BadgeTier,
  previousTier: BadgeTier | null,
): string {
  if (currentTier === "none" && (!previousTier || previousTier === "none")) {
    return "Collect verified client feedback to establish your first monthly tier.";
  }

  if (!previousTier || previousTier === currentTier) {
    if (currentTier === "none") {
      return "Your monthly tier will appear once you have enough recent verified feedback.";
    }

    return "Your tier held steady this month.";
  }

  if (TIER_RANK[currentTier] > TIER_RANK[previousTier]) {
    return `You moved up from ${BADGE_TIER_LABELS[previousTier]} this month.`;
  }

  return `Your tier shifted from ${BADGE_TIER_LABELS[previousTier]} this month. Recent client feedback drives monthly updates.`;
}

export function describeNextTierGuidance(
  currentTier: BadgeTier,
  nextTier: BadgeTier | null,
  latestSnapshot: BadgeSnapshot | null,
): string {
  if (!nextTier) {
    return "You're at the top monthly tier. Consistent verified feedback helps you maintain Elite standing.";
  }

  if (!latestSnapshot?.eligible) {
    return `You need at least ${MIN_REVIEWS_FOR_ELIGIBILITY} verified client experiences in the last 90 days to qualify for a monthly tier.`;
  }

  const threshold =
    nextTier === "none"
      ? null
      : FIXED_THRESHOLD_FALLBACK[nextTier as keyof typeof FIXED_THRESHOLD_FALLBACK];

  if (threshold !== null && latestSnapshot.trustScore < threshold) {
    const roundedScore = Math.round(latestSnapshot.trustScore);
    return `Your trust score is ${roundedScore}. In smaller fields, scores near ${threshold} often reach ${BADGE_TIER_LABELS[nextTier]}. More strong, verified client feedback improves your recommendation rate and quality signals.`;
  }

  return `Sustained verified feedback and high recommendation intent help you move closer to ${BADGE_TIER_LABELS[nextTier]} when monthly tiers are recalculated.`;
}

export function buildDashboardReputationSummary(
  currentTier: BadgeTier,
  history: BadgeSnapshot[],
): DashboardReputationSummary {
  const sorted = [...history].sort((left, right) =>
    right.period.localeCompare(left.period),
  );
  const latestSnapshot = sorted[0] ?? null;
  const previousSnapshot = sorted[1] ?? null;
  const nextTier = getNextBadgeTier(currentTier);

  const recommendationRatePercent =
    latestSnapshot && latestSnapshot.eligible
      ? Math.round(latestSnapshot.componentBreakdown.wilson_recommend * 100)
      : null;

  return {
    movementMessage: formatTierMovementMessage(
      currentTier,
      previousSnapshot?.badgeTier ?? null,
    ),
    verifiedExperiencesWindow:
      latestSnapshot?.reviewCountWindow ??
      latestSnapshot?.componentBreakdown.review_count_window ??
      0,
    recommendationRatePercent,
    consecutiveActiveMonths: computeConsecutiveActiveMonths(history),
    nextTier,
    nextTierGuidance: describeNextTierGuidance(
      currentTier,
      nextTier,
      latestSnapshot,
    ),
  };
}
