import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Muted } from "@/components/typography/typography";
import { describeTrustBadgeWhy } from "@/lib/badges/display";
import {
  formatReputationUpdatedLabel,
  formatVerifiedExperienceCount,
  HOW_BADGE_WORKS_HEADING,
  HOW_BADGE_WORKS_SUMMARY,
  REPUTATION_HISTORY_LABEL,
  REPUTATION_HISTORY_SECTION_ID,
} from "@/lib/badges/reputation-copy";
import { cn } from "@/lib/utils";

interface HowBadgeWorksProps {
  reviewCount: number;
  badgePeriod: string | null;
  professionName: string | null;
  eligible: boolean;
  /** Hash link to on-page history; pass `null` to hide the link. */
  reputationHistoryHref?: string | null;
  className?: string;
  borderClassName?: string;
}

export function HowBadgeWorks({
  reviewCount,
  badgePeriod,
  professionName,
  eligible,
  reputationHistoryHref = `#${REPUTATION_HISTORY_SECTION_ID}`,
  className,
  borderClassName = "border-t border-border/80",
}: HowBadgeWorksProps) {
  const [expanded, setExpanded] = useState(false);

  const detailText = describeTrustBadgeWhy({
    reviewCount,
    professionName,
    eligible,
  });

  return (
    <div className={cn(borderClassName, "pt-4", className)}>
      <button
        type="button"
        id="how-badge-works-trigger"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-foreground"
        aria-expanded={expanded}
        aria-controls="how-badge-works-panel"
      >
        <span>{HOW_BADGE_WORKS_HEADING}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {!expanded ? (
        <Muted className="mt-2 line-clamp-2 text-xs leading-relaxed">
          {HOW_BADGE_WORKS_SUMMARY}
        </Muted>
      ) : null}

      {expanded ? (
        <div
          id="how-badge-works-panel"
          role="region"
          aria-labelledby="how-badge-works-trigger"
          className="mt-3 space-y-4"
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            {HOW_BADGE_WORKS_SUMMARY}
          </p>

          <dl className="grid gap-2 text-sm">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-muted-foreground">Verified client experiences</dt>
              <dd className="font-medium text-foreground">
                {formatVerifiedExperienceCount(reviewCount)}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-muted-foreground">Most recent update</dt>
              <dd className="font-medium text-foreground">
                {formatReputationUpdatedLabel(badgePeriod)}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-muted-foreground">Reputation history</dt>
              <dd className="font-medium text-foreground">
                {reputationHistoryHref ? (
                  <a
                    href={reputationHistoryHref}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {REPUTATION_HISTORY_LABEL}
                  </a>
                ) : (
                  REPUTATION_HISTORY_LABEL
                )}
              </dd>
            </div>
          </dl>

          <Muted className="text-sm leading-relaxed">{detailText}</Muted>
        </div>
      ) : null}
    </div>
  );
}
