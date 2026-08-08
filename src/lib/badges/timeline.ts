import type { BadgeSnapshot, BadgeSubTier, BadgeTier } from "@/types/badge";
import { REPUTATION_HISTORY_MONTHS } from "@/lib/badges/reputation-copy";
import { formatBadgeLabel } from "@/lib/badges/display";

export const TIER_TIMELINE_ABBREV: Record<BadgeTier, string> = {
  none: "—",
  bronze: "B",
  silver: "S",
  gold: "G",
  platinum: "P",
  elite: "E",
};

export interface ReputationTimelineMonth {
  period: string;
  monthLabel: string;
  tier: BadgeTier | null;
  subTier: BadgeSubTier | null;
  hasData: boolean;
}

export function periodFromUtcDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function buildReputationTimeline(
  history: BadgeSnapshot[],
  months = REPUTATION_HISTORY_MONTHS,
  anchorDate = new Date(),
): ReputationTimelineMonth[] {
  const byPeriod = new Map(history.map((snapshot) => [snapshot.period, snapshot]));
  const slots: ReputationTimelineMonth[] = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth() - offset, 1),
    );
    const period = periodFromUtcDate(date);
    const snapshot = byPeriod.get(period);

    slots.push({
      period,
      monthLabel: date.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      tier: snapshot?.badgeTier ?? null,
      subTier: snapshot?.badgeSubTier ?? null,
      hasData: Boolean(snapshot),
    });
  }

  return slots;
}

export function getLatestBadgeSnapshot(
  history: BadgeSnapshot[],
): BadgeSnapshot | null {
  if (history.length === 0) {
    return null;
  }

  return [...history].sort((left, right) =>
    right.period.localeCompare(left.period),
  )[0];
}

export function formatCurrentTimelineLabel(snapshot: BadgeSnapshot | null): string {
  if (!snapshot) {
    return "Current: —";
  }

  return `Current: ${formatBadgeLabel(snapshot.badgeTier, snapshot.badgeSubTier)}`;
}
