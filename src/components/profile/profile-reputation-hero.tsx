import { TrustBadge } from "@/components/badges/trust-badge";
import { Muted, SectionEyebrow } from "@/components/typography/typography";
import {
  BADGE_TIER_ACCENT,
  formatBadgeHeroTitle,
} from "@/lib/badges/display";
import {
  CURRENT_REPUTATION_LABEL,
  formatReputationUpdatedLabel,
  formatVerifiedExperienceCount,
  REPUTATION_NOW_TAGLINE,
} from "@/lib/badges/reputation-copy";
import type { BadgeSubTier, BadgeTier } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileReputationHeroProps {
  badgeTier: BadgeTier;
  badgeSubTier?: BadgeSubTier | null;
  badgePeriod: string | null;
  reviewCount: number;
  className?: string;
}

export function ProfileReputationHero({
  badgeTier,
  badgeSubTier = null,
  badgePeriod,
  reviewCount,
  className,
}: ProfileReputationHeroProps) {
  const heroTitle = formatBadgeHeroTitle(badgeTier, badgeSubTier);
  const experienceLabel = formatVerifiedExperienceCount(reviewCount);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm border-l-4",
        BADGE_TIER_ACCENT[badgeTier],
        className,
      )}
      aria-labelledby="current-reputation-heading"
    >
      <div className="space-y-5 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-2 text-center sm:text-left">
            <SectionEyebrow id="current-reputation-heading">
              {CURRENT_REPUTATION_LABEL}
            </SectionEyebrow>
            <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heroTitle}
            </p>
            <Muted className="text-sm">
              {formatReputationUpdatedLabel(badgePeriod)}
            </Muted>
            <p className="text-sm font-medium text-foreground">
              {experienceLabel}
            </p>
            <Muted className="text-xs leading-relaxed">
              {REPUTATION_NOW_TAGLINE}
            </Muted>
          </div>

          <div className="flex justify-center sm:justify-end">
            <TrustBadge
              tier={badgeTier}
              subTier={badgeSubTier}
              size="lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
