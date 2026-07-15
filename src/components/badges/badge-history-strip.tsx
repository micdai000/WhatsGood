import { TrustBadge } from "@/components/badges/trust-badge";
import { Muted } from "@/components/typography/typography";
import { formatBadgePeriod } from "@/lib/badges/display";
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
    <section className={cn("space-y-3", className)} aria-label="Badge history">
      <Muted className="text-xs font-medium uppercase tracking-wide">
        Recent badges
      </Muted>
      <div className="flex flex-wrap gap-2">
        {history.map((snapshot) => (
          <div
            key={snapshot.id}
            className="flex flex-col items-start gap-1 rounded-lg border border-border bg-card px-2.5 py-2"
          >
            <TrustBadge tier={snapshot.badgeTier} size="sm" />
            <Muted className="text-[10px]">
              {formatBadgePeriod(snapshot.period)}
            </Muted>
          </div>
        ))}
      </div>
    </section>
  );
}
