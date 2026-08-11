import type { BadgeSubTier, BadgeTier } from "@/types/badge";
import { REPUTATION_RECENCY_WINDOW } from "@/lib/badges/reputation-copy";

export const BADGE_TIER_LABELS: Record<BadgeTier, string> = {
  none: "Building trust",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  elite: "Elite",
};

/** Short mark used on credential-style badges and timelines. */
export const BADGE_TIER_MONOGRAM: Record<BadgeTier, string> = {
  none: "—",
  bronze: "B",
  silver: "S",
  gold: "G",
  platinum: "P",
  elite: "E",
};

/**
 * Restrained tier styling — credential-like, not gamified.
 * Prefer neutral surfaces with subtle tier accents.
 */
export const BADGE_TIER_STYLES: Record<
  BadgeTier,
  { badge: string; icon: string }
> = {
  none: {
    badge: "border-border bg-card text-muted-foreground shadow-sm",
    icon: "text-muted-foreground",
  },
  bronze: {
    badge: "border-amber-900/15 bg-card text-foreground shadow-sm dark:border-amber-500/20",
    icon: "text-amber-900 dark:text-amber-200",
  },
  silver: {
    badge: "border-slate-500/15 bg-card text-foreground shadow-sm dark:border-slate-400/20",
    icon: "text-slate-700 dark:text-slate-200",
  },
  gold: {
    badge: "border-yellow-800/15 bg-card text-foreground shadow-sm dark:border-yellow-600/20",
    icon: "text-yellow-900 dark:text-yellow-100",
  },
  platinum: {
    badge: "border-sky-800/15 bg-card text-foreground shadow-sm dark:border-sky-500/20",
    icon: "text-sky-900 dark:text-sky-100",
  },
  elite: {
    badge: "border-violet-800/15 bg-card text-foreground shadow-sm dark:border-violet-500/20",
    icon: "text-violet-900 dark:text-violet-100",
  },
};

/** Inner seal on credential badges (monogram container). */
export const BADGE_TIER_SEAL: Record<BadgeTier, string> = {
  none: "border-border bg-muted/50 text-muted-foreground",
  bronze:
    "border-amber-900/20 bg-amber-50/80 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100",
  silver:
    "border-slate-500/20 bg-slate-50/80 text-slate-900 dark:border-slate-400/30 dark:bg-slate-900/50 dark:text-slate-100",
  gold:
    "border-yellow-800/20 bg-yellow-50/70 text-yellow-950 dark:border-yellow-600/30 dark:bg-yellow-950/40 dark:text-yellow-100",
  platinum:
    "border-sky-800/20 bg-sky-50/70 text-sky-950 dark:border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-100",
  elite:
    "border-violet-800/20 bg-violet-50/70 text-violet-950 dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-100",
};

/** Left accent for reputation hero panels. */
export const BADGE_TIER_ACCENT: Record<BadgeTier, string> = {
  none: "border-l-muted-foreground/30",
  bronze: "border-l-amber-700/50 dark:border-l-amber-500/40",
  silver: "border-l-slate-500/50 dark:border-l-slate-400/40",
  gold: "border-l-yellow-700/50 dark:border-l-yellow-500/40",
  platinum: "border-l-sky-600/50 dark:border-l-sky-400/40",
  elite: "border-l-violet-600/50 dark:border-l-violet-400/40",
};

export const BADGE_TIER_TIMELINE_CELL: Record<BadgeTier, string> = {
  none: "border-border bg-muted/40 text-muted-foreground",
  bronze:
    "border-amber-900/15 bg-amber-50/60 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100",
  silver:
    "border-slate-500/15 bg-slate-50/60 text-slate-900 dark:bg-slate-900/40 dark:text-slate-100",
  gold:
    "border-yellow-800/15 bg-yellow-50/60 text-yellow-950 dark:bg-yellow-950/30 dark:text-yellow-100",
  platinum:
    "border-sky-800/15 bg-sky-50/60 text-sky-950 dark:bg-sky-950/30 dark:text-sky-100",
  elite:
    "border-violet-800/15 bg-violet-50/60 text-violet-950 dark:bg-violet-950/30 dark:text-violet-100",
};

export const BADGE_TIER_BAR: Record<BadgeTier, string> = {
  none: "bg-muted-foreground/25",
  bronze: "bg-amber-700/50 dark:bg-amber-500/40",
  silver: "bg-slate-500/50 dark:bg-slate-400/40",
  gold: "bg-yellow-700/45 dark:bg-yellow-500/35",
  platinum: "bg-sky-600/45 dark:bg-sky-400/35",
  elite: "bg-violet-600/45 dark:bg-violet-400/35",
};

export function formatBadgeLabel(
  tier: BadgeTier,
  subTier?: BadgeSubTier | null,
): string {
  if (tier === "none") {
    return BADGE_TIER_LABELS.none;
  }

  if (!subTier) {
    return BADGE_TIER_LABELS[tier];
  }

  return `${BADGE_TIER_LABELS[tier]} · Tier ${subTier}`;
}

/** Large profile hero title (e.g. Gold · Tier 2). */
export function formatBadgeHeroTitle(
  tier: BadgeTier,
  subTier?: BadgeSubTier | null,
): string {
  return formatBadgeLabel(tier, subTier);
}

export function formatBadgePeriod(period: string): string {
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function describeTrustBadgeWhy(options: {
  reviewCount: number;
  professionName: string | null;
  eligible: boolean;
}): string {
  const professionLabel = options.professionName ?? "professionals";
  const experienceLabel =
    options.reviewCount === 1
      ? "1 verified client experience"
      : `${options.reviewCount} verified client experiences`;

  if (!options.eligible) {
    return `Based on ${experienceLabel} over the ${REPUTATION_RECENCY_WINDOW}. At least 3 recent verified experiences are needed to establish a current monthly tier.`;
  }

  return `Current reputation is based on ${experienceLabel} over the ${REPUTATION_RECENCY_WINDOW}, ranked against other ${professionLabel} in the same field.`;
}
