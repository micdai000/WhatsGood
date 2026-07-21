import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TrustBadge } from "@/components/badges/trust-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Muted, Paragraph } from "@/components/typography/typography";
import {
  describeTrustBadgeWhy,
  formatBadgeLabel,
  formatBadgePeriod,
} from "@/lib/badges/display";
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
}

export function TrustBadgeSummary({
  badgeTier,
  badgeSubTier = null,
  badgePeriod,
  professionName,
  reviewCountWindow,
  eligible,
  className,
}: TrustBadgeSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const whyText = describeTrustBadgeWhy({
    reviewCount: reviewCountWindow,
    professionName,
    eligible,
  });

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="space-y-4 py-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <TrustBadge tier={badgeTier} subTier={badgeSubTier} size="lg" />
          <div className="space-y-1">
            <Paragraph className="font-semibold">
              {formatBadgeLabel(badgeTier, badgeSubTier)}
            </Paragraph>
            {badgePeriod ? (
              <Muted className="text-sm">
                Earned {formatBadgePeriod(badgePeriod)}
              </Muted>
            ) : (
              <Muted className="text-sm">No monthly badge yet</Muted>
            )}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-foreground"
            aria-expanded={expanded}
          >
            <span>How this badge works</span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform",
                expanded && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          {expanded ? (
            <Muted className="mt-3 text-sm leading-relaxed">{whyText}</Muted>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
