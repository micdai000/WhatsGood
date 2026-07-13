import type { BadgeTier } from "@/types/badge";

export const BADGE_TIER_LABELS: Record<BadgeTier, string> = {
  none: "Building trust",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  elite: "Elite",
};

export const BADGE_TIER_STYLES: Record<
  BadgeTier,
  { badge: string; icon: string }
> = {
  none: {
    badge: "border-border bg-muted text-muted-foreground",
    icon: "text-muted-foreground",
  },
  bronze: {
    badge: "border-amber-700/30 bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
    icon: "text-amber-700 dark:text-amber-300",
  },
  silver: {
    badge: "border-slate-400/30 bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200",
    icon: "text-slate-600 dark:text-slate-300",
  },
  gold: {
    badge: "border-yellow-600/30 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200",
    icon: "text-yellow-600 dark:text-yellow-300",
  },
  elite: {
    badge: "border-violet-500/30 bg-violet-100 text-violet-900 dark:bg-violet-950/40 dark:text-violet-200",
    icon: "text-violet-600 dark:text-violet-300",
  },
};

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
  const reviewLabel =
    options.reviewCount === 1 ? "1 review" : `${options.reviewCount} reviews`;

  if (!options.eligible) {
    return `Based on ${reviewLabel} over the last 3 months. At least 3 recent reviews are needed to earn a monthly badge and be ranked against other ${professionLabel}.`;
  }

  return `Based on ${reviewLabel} over the last 3 months, ranked against other ${professionLabel} in the same field.`;
}
