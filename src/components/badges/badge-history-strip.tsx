import { TrustBadge } from "@/components/badges/trust-badge";
import { Muted } from "@/components/typography/typography";
import { formatBadgePeriod } from "@/lib/badges/display";
import { REPUTATION_HISTORY_LABEL } from "@/lib/badges/reputation-copy";
import type { BadgeSnapshot } from "@/types/badge";
import { cn } from "@/lib/utils";

interface BadgeHistoryStripProps {
  history: BadgeSnapshot[];
  className?: string;
}

export function BadgeHistoryStrip({ history, className }: BadgeHistoryStripProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-3", className)} aria-label={REPUTATION_HISTORY_LABEL}>
      <Muted className="text-xs font-medium uppercase tracking-wide">
        {REPUTATION_HISTORY_LABEL}
      </Muted>
      <div className="flex flex-wrap gap-2">
        {history.map((snapshot) => (
          <div
            key={snapshot.id}
            className="flex flex-col items-start gap-1 rounded-lg border border-border bg-card px-2.5 py-2"
          >
            <TrustBadge
              tier={snapshot.badgeTier}
              subTier={snapshot.badgeSubTier}
              size="sm"
            />
            <Muted className="text-[10px]">
              {formatBadgePeriod(snapshot.period)}
            </Muted>
          </div>
        ))}
      </div>
    </section>
  );
}
