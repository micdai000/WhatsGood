import { Award } from "lucide-react";
import {
  BADGE_TIER_LABELS,
  BADGE_TIER_STYLES,
} from "@/lib/badges/display";
import type { BadgeTier } from "@/types/badge";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  tier: BadgeTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    wrap: "gap-1 px-2 py-0.5 text-[10px]",
    icon: "size-3",
  },
  md: {
    wrap: "gap-1.5 px-2.5 py-1 text-xs",
    icon: "size-3.5",
  },
  lg: {
    wrap: "gap-2 px-3 py-1.5 text-sm",
    icon: "size-4",
  },
} as const;

export function TrustBadge({
  tier,
  size = "md",
  showLabel = true,
  className,
}: TrustBadgeProps) {
  const styles = BADGE_TIER_STYLES[tier];
  const sizes = sizeClasses[size];

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border font-medium",
        styles.badge,
        sizes.wrap,
        className,
      )}
    >
      <Award className={cn(sizes.icon, styles.icon)} aria-hidden />
      {showLabel ? <span>{BADGE_TIER_LABELS[tier]}</span> : null}
    </span>
  );
}
