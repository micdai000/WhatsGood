import { TrustBadge } from "@/components/badges/trust-badge";
import { Muted, Paragraph, SectionEyebrow } from "@/components/typography/typography";
import {
  BADGE_TIER_ACCENT,
  BADGE_TIER_LABELS,
  formatBadgeHeroTitle,
} from "@/lib/badges/display";
import {
  CURRENT_REPUTATION_LABEL,
  formatReputationUpdatedLabel,
  REPUTATION_RECENCY_WINDOW,
} from "@/lib/badges/reputation-copy";
import type { DashboardProfile, DashboardReputationSummary } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardReputationPanelProps {
  profile: DashboardProfile;
  reputation: DashboardReputationSummary;
  className?: string;
}

function formatRecommendationRate(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return `${value}%`;
}

function formatConsecutiveMonths(count: number): string {
  if (count === 0) {
    return "—";
  }

  if (count === 1) {
    return "1 month";
  }

  return `${count} months`;
}

export function DashboardReputationPanel({
  profile,
  reputation,
  className,
}: DashboardReputationPanelProps) {
  const heroTitle = formatBadgeHeroTitle(profile.badgeTier, profile.badgeSubTier);
  const nextTierLabel = reputation.nextTier
    ? BADGE_TIER_LABELS[reputation.nextTier]
    : null;

  return (
    <div className={cn("space-y-6", className)}>
      <section
        className={cn(
          "overflow-hidden rounded-2xl border border-border bg-card shadow-sm border-l-4",
          BADGE_TIER_ACCENT[profile.badgeTier],
        )}
        aria-labelledby="dashboard-current-reputation"
      >
        <div className="space-y-3 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-2 text-center sm:text-left">
              <SectionEyebrow id="dashboard-current-reputation">
                {CURRENT_REPUTATION_LABEL}
              </SectionEyebrow>
              <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {heroTitle}
              </p>
              <Muted className="text-sm">
                {formatReputationUpdatedLabel(profile.badgePeriod)}
              </Muted>
              <Paragraph className="text-sm font-medium text-foreground">
                {reputation.movementMessage}
              </Paragraph>
            </div>

            <div className="flex justify-center sm:justify-end">
              <TrustBadge
                tier={profile.badgeTier}
                subTier={profile.badgeSubTier}
                size="lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
        aria-labelledby="what-changed-heading"
      >
        <SectionEyebrow id="what-changed-heading" className="mb-4">
          What changed?
        </SectionEyebrow>
        <ul className="grid gap-4 sm:grid-cols-3">
          <li className="space-y-1">
            <Muted className="text-xs font-medium uppercase tracking-wide">
              Verified experiences
            </Muted>
            <Paragraph className="text-lg font-semibold tabular-nums">
              {reputation.verifiedExperiencesWindow}
            </Paragraph>
            <Muted className="text-xs">{REPUTATION_RECENCY_WINDOW}</Muted>
          </li>
          <li className="space-y-1">
            <Muted className="text-xs font-medium uppercase tracking-wide">
              Recommendation rate
            </Muted>
            <Paragraph className="text-lg font-semibold tabular-nums">
              {formatRecommendationRate(reputation.recommendationRatePercent)}
            </Paragraph>
            <Muted className="text-xs">From recent verified feedback</Muted>
          </li>
          <li className="space-y-1">
            <Muted className="text-xs font-medium uppercase tracking-wide">
              Consecutive active months
            </Muted>
            <Paragraph className="text-lg font-semibold tabular-nums">
              {formatConsecutiveMonths(reputation.consecutiveActiveMonths)}
            </Paragraph>
            <Muted className="text-xs">Months with a qualified tier</Muted>
          </li>
        </ul>
      </section>

      {nextTierLabel ? (
        <section
          className="rounded-2xl border border-border bg-muted/30 p-5 sm:p-6"
          aria-labelledby="next-tier-heading"
        >
          <SectionEyebrow id="next-tier-heading" className="mb-2">
            Next tier: {nextTierLabel}
          </SectionEyebrow>
          <Paragraph className="text-sm leading-relaxed text-foreground">
            {reputation.nextTierGuidance}
          </Paragraph>
        </section>
      ) : (
        <section
          className="rounded-2xl border border-border bg-muted/30 p-5 sm:p-6"
          aria-labelledby="next-tier-heading"
        >
          <SectionEyebrow id="next-tier-heading" className="mb-2">
            Maintaining Elite
          </SectionEyebrow>
          <Paragraph className="text-sm leading-relaxed text-foreground">
            {reputation.nextTierGuidance}
          </Paragraph>
        </section>
      )}
    </div>
  );
}
