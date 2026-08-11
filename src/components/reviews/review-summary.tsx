import { TrustBadge } from "@/components/badges/trust-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Muted, Paragraph } from "@/components/typography/typography";
import { formatBadgeLabel } from "@/lib/badges/display";
import {
  CURRENT_REPUTATION_LABEL,
  formatVerifiedExperienceCount,
} from "@/lib/badges/reputation-copy";
import type { BadgeSubTier, BadgeTier } from "@/types/badge";
import { cn } from "@/lib/utils";

interface ReviewSummaryProps {
  badgeTier: BadgeTier;
  badgeSubTier?: BadgeSubTier | null;
  totalReviews: number;
  className?: string;
}

export function ReviewSummary({
  badgeTier,
  badgeSubTier = null,
  totalReviews,
  className,
}: ReviewSummaryProps) {
  const experienceLabel = formatVerifiedExperienceCount(totalReviews);

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:justify-center sm:gap-6 sm:text-left">
        <TrustBadge tier={badgeTier} subTier={badgeSubTier} size="lg" />
        <div className="space-y-1">
          <Paragraph className="font-semibold">
            {formatBadgeLabel(badgeTier, badgeSubTier)}
          </Paragraph>
          <Muted className="text-sm">{CURRENT_REPUTATION_LABEL}</Muted>
          <Muted className="text-sm">{experienceLabel}</Muted>
        </div>
      </CardContent>
    </Card>
  );
}
