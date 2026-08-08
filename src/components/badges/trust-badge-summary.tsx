import { TrustBadge } from "@/components/badges/trust-badge";
import { HowBadgeWorks } from "@/components/badges/how-badge-works";
import { Muted, Paragraph } from "@/components/typography/typography";
import { formatBadgeLabel } from "@/lib/badges/display";
import {
  CURRENT_REPUTATION_LABEL,
  formatReputationUpdatedLabel,
  formatVerifiedExperienceCount,
} from "@/lib/badges/reputation-copy";
import type { BadgeSubTier, BadgeTier } from "@/types/badge";
import { cn } from "@/lib/utils";

interface TrustBadgeSummaryProps {
  badgeTier: BadgeTier;
  badgeSubTier?: BadgeSubTier | null;
  badgePeriod: string | null;
  professionName: string | null;
  reviewCountWindow: number;
  eligible: boolean;
  className?: string;
  reputationHistoryHref?: string | null;
}

export function TrustBadgeSummary({
  badgeTier,
  badgeSubTier = null,
  badgePeriod,
  professionName,
  reviewCountWindow,
  eligible,
  className,
  reputationHistoryHref,
}: TrustBadgeSummaryProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:text-left">
        <TrustBadge tier={badgeTier} subTier={badgeSubTier} size="lg" />
        <div className="min-w-0 flex-1 space-y-0.5">
          <Muted className="text-xs font-medium uppercase tracking-wide">
            {CURRENT_REPUTATION_LABEL}
          </Muted>
          <Paragraph className="font-semibold">
            {formatBadgeLabel(badgeTier, badgeSubTier)}
          </Paragraph>
          <Muted className="text-sm">
            {formatReputationUpdatedLabel(badgePeriod)}
          </Muted>
          <Muted className="text-sm">
            {formatVerifiedExperienceCount(reviewCountWindow)}
          </Muted>
        </div>
      </div>

      <HowBadgeWorks
        reviewCount={reviewCountWindow}
        badgePeriod={badgePeriod}
        professionName={professionName}
        eligible={eligible}
        reputationHistoryHref={reputationHistoryHref}
        borderClassName="border-t border-border"
      />
    </div>
  );
}
