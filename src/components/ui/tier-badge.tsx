import { type Tier, tierLabels, tierColors } from "@/data/mock";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "text-[10px] px-2 py-[3px]",
  md: "text-[11px] px-2.5 py-1",
  lg: "text-[13px] px-3.5 py-1.5",
} as const;

interface TierBadgeProps {
  tier: Tier;
  size?: "sm" | "md" | "lg";
}

export function TierBadge({ tier, size = "sm" }: TierBadgeProps) {
  const colors = tierColors[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-bold uppercase tracking-widest",
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size],
      )}
    >
      {tierLabels[tier]}
    </span>
  );
}
