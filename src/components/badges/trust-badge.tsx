import {
  BADGE_TIER_MONOGRAM,
  BADGE_TIER_SEAL,
  BADGE_TIER_STYLES,
  formatBadgeLabel,
} from "@/lib/badges/display";
import type { BadgeSubTier, BadgeTier } from "@/types/badge";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  tier: BadgeTier;
  subTier?: BadgeSubTier | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    wrap: "gap-1.5 px-2 py-1",
    seal: "size-5 text-[9px]",
    label: "text-[10px]",
  },
  md: {
    wrap: "gap-2 px-2.5 py-1.5",
    seal: "size-6 text-[10px]",
    label: "text-xs",
  },
  lg: {
    wrap: "gap-2.5 px-3 py-2",
    seal: "size-8 text-xs",
    label: "text-sm",
  },
} as const;

export function TrustBadge({
  tier,
  subTier = null,
  size = "md",
  showLabel = true,
  className,
}: TrustBadgeProps) {
  const styles = BADGE_TIER_STYLES[tier];
  const sizes = sizeClasses[size];
  const label = formatBadgeLabel(tier, subTier);

  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center rounded-lg border font-medium",
        styles.badge,
        sizes.wrap,
        className,
      )}
      title={label}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded border font-semibold tabular-nums tracking-tight",
          BADGE_TIER_SEAL[tier],
          sizes.seal,
        )}
        aria-hidden
      >
        {BADGE_TIER_MONOGRAM[tier]}
      </span>
      {showLabel ? (
        <span className={cn("min-w-0 truncate font-semibold tracking-tight", sizes.label)}>
          {label}
        </span>
      ) : null}
    </span>
  );
}
