import { Muted, Paragraph } from "@/components/typography/typography";
import { BADGE_TIER_LABELS, BADGE_TIER_TIMELINE_CELL } from "@/lib/badges/display";
import { REPUTATION_HISTORY_LABEL } from "@/lib/badges/reputation-copy";
import {
  buildReputationTimeline,
  formatCurrentTimelineLabel,
  getLatestBadgeSnapshot,
  TIER_TIMELINE_ABBREV,
} from "@/lib/badges/timeline";
import type { BadgeSnapshot, BadgeTier } from "@/types/badge";
import { cn } from "@/lib/utils";

interface ReputationTimelineProps {
  history: BadgeSnapshot[];
  className?: string;
  showSectionHeader?: boolean;
}

const LEGEND_TIERS: BadgeTier[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "elite",
];

export function ReputationTimeline({
  history,
  className,
  showSectionHeader = true,
}: ReputationTimelineProps) {
  if (history.length === 0) {
    return null;
  }

  const months = buildReputationTimeline(history);
  const currentLabel = formatCurrentTimelineLabel(getLatestBadgeSnapshot(history));

  return (
    <section
      className={cn("space-y-4", className)}
      aria-label={REPUTATION_HISTORY_LABEL}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        {showSectionHeader ? (
          <Muted className="text-xs font-medium uppercase tracking-wide">
            {REPUTATION_HISTORY_LABEL}
          </Muted>
        ) : null}
        <Paragraph className="text-sm font-semibold">{currentLabel}</Paragraph>
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          className="min-w-[36rem] grid grid-cols-12 gap-1 sm:gap-1.5"
          role="list"
          aria-label="Monthly reputation timeline"
        >
          {months.map((month) => {
            const tier = month.tier ?? "none";
            const abbrev = month.hasData
              ? TIER_TIMELINE_ABBREV[tier]
              : "·";
            const title = month.hasData
              ? `${month.monthLabel}: ${BADGE_TIER_LABELS[tier]}`
              : `${month.monthLabel}: No data`;

            return (
              <div key={month.period} role="listitem" className="min-w-0 text-center">
                <Muted className="mb-1 block truncate text-[10px] font-medium uppercase tracking-wide">
                  {month.monthLabel}
                </Muted>
                <div
                  title={title}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-md border text-sm font-bold tabular-nums",
                    month.hasData
                      ? BADGE_TIER_TIMELINE_CELL[tier]
                      : "border-dashed border-border bg-muted/30 text-muted-foreground",
                  )}
                  aria-label={title}
                >
                  {abbrev}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {LEGEND_TIERS.map((tier) => (
          <li key={tier} className="inline-flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex size-5 items-center justify-center rounded border text-[10px] font-bold",
                BADGE_TIER_TIMELINE_CELL[tier],
              )}
              aria-hidden
            >
              {TIER_TIMELINE_ABBREV[tier]}
            </span>
            {BADGE_TIER_LABELS[tier]}
          </li>
        ))}
      </ul>
    </section>
  );
}
