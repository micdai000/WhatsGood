import { TrustBadge } from "@/components/badges";
import { Muted, Paragraph } from "@/components/typography/typography";
import {
  describeTrustBadgeWhy,
  formatBadgeLabel,
  formatBadgePeriod,
} from "@/lib/badges/display";
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
  const whyText = describeTrustBadgeWhy({
    reviewCount,
    professionName,
    eligible: reviewCount > 0,
  });

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <Muted className="text-xs font-medium uppercase tracking-wide">
        Current trust badge
      </Muted>

      <div className="mt-4 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:text-left">
        <TrustBadge tier={badgeTier} subTier={badgeSubTier} size="lg" />
        <div className="min-w-0 space-y-0.5">
          <Paragraph className="text-sm font-semibold">
            {formatBadgeLabel(badgeTier, badgeSubTier)}
          </Paragraph>
          {badgePeriod ? (
            <Muted className="text-xs">
              Earned {formatBadgePeriod(badgePeriod)}
            </Muted>
          ) : (
            <Muted className="text-xs">No monthly badge yet</Muted>
          )}
        </div>
      </div>

      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        {whyText}
      </p>
    </div>
  );
}
