import { Muted, Paragraph } from "@/components/typography/typography";
import { BADGE_TIER_LABELS } from "@/lib/badges/display";
import type { BadgeSnapshot, BadgeTier } from "@/types/badge";
import { cn } from "@/lib/utils";

interface TierHistoryBreakdownProps {
  history: BadgeSnapshot[];
  className?: string;
}

const TIER_DISPLAY_ORDER: BadgeTier[] = [
  "elite",
  "platinum",
  "gold",
  "silver",
  "bronze",
];

const TIER_BAR_COLORS: Record<BadgeTier, string> = {
  none: "bg-muted-foreground/30",
  bronze: "bg-amber-500",
  silver: "bg-slate-400",
  gold: "bg-yellow-500",
  platinum: "bg-sky-500",
  elite: "bg-violet-500",
};

export function TierHistoryBreakdown({
  history,
  className,
}: TierHistoryBreakdownProps) {
  if (history.length === 0) {
    return null;
  }

  const counts = history.reduce<Record<BadgeTier, number>>(
    (acc, snapshot) => {
      acc[snapshot.badgeTier] += 1;
      return acc;
    },
    { none: 0, bronze: 0, silver: 0, gold: 0, platinum: 0, elite: 0 },
  );

  const total = history.length;

  return (
    <div className={cn("space-y-3", className)}>
      <Paragraph className="text-sm font-medium">Badge history</Paragraph>
      <ul className="space-y-2">
        {TIER_DISPLAY_ORDER.map((tier) => {
          const count = counts[tier];
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <li
              key={tier}
              className="grid grid-cols-[5rem_1fr_2.5rem] items-center gap-3"
            >
              <span className="text-sm">{BADGE_TIER_LABELS[tier]}</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    TIER_BAR_COLORS[tier],
                  )}
                  style={{ width: `${percentage}%` }}
                  role="presentation"
                />
              </div>
              <Muted className="text-right text-xs tabular-nums">
                {count} {count === 1 ? "mo" : "mos"}
              </Muted>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
