import { TrustBadge } from "@/components/badges";
import { HowBadgeWorks } from "@/components/badges/how-badge-works";
import { Muted, Paragraph } from "@/components/typography/typography";
import { formatBadgeLabel } from "@/lib/badges/display";
import {
  CURRENT_REPUTATION_LABEL,
  formatReputationUpdatedLabel,
  formatVerifiedExperienceCount,
} from "@/lib/badges/reputation-copy";
import { MIN_REVIEWS_FOR_ELIGIBILITY } from "@/lib/constants/badges";
import type { BadgeSubTier, BadgeTier } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileTrustCardProps {
  badgeTier: BadgeTier;
  badgeSubTier?: BadgeSubTier | null;
  badgePeriod: string | null;
  professionName: string | null;
  reviewCount: number;
  className?: string;
}

export function ProfileTrustCard({
  badgeTier,
  badgeSubTier = null,
  badgePeriod,
  professionName,
  reviewCount,
  className,
}: ProfileTrustCardProps) {
  const eligible = reviewCount >= MIN_REVIEWS_FOR_ELIGIBILITY;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <Muted className="text-xs font-medium uppercase tracking-wide">
        {CURRENT_REPUTATION_LABEL}
      </Muted>

      <div className="mt-4 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:text-left">
        <TrustBadge tier={badgeTier} subTier={badgeSubTier} size="lg" />
        <div className="min-w-0 space-y-0.5">
          <Paragraph className="text-sm font-semibold">
            {formatBadgeLabel(badgeTier, badgeSubTier)}
          </Paragraph>
          <Muted className="text-xs">
            {formatReputationUpdatedLabel(badgePeriod)}
          </Muted>
          <Muted className="text-xs">
            {formatVerifiedExperienceCount(reviewCount)}
          </Muted>
        </div>
      </div>

      <HowBadgeWorks
        reviewCount={reviewCount}
        badgePeriod={badgePeriod}
        professionName={professionName}
        eligible={eligible}
        reputationHistoryHref={null}
        borderClassName="border-t border-border"
      />
    </div>
  );
}
