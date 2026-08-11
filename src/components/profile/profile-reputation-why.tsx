import { HowBadgeWorks } from "@/components/badges/how-badge-works";
import { SectionEyebrow } from "@/components/typography/typography";
import { MIN_REVIEWS_FOR_ELIGIBILITY } from "@/lib/constants/badges";
import type { BadgeSubTier, BadgeTier } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileReputationWhyProps {
  badgePeriod: string | null;
  professionName: string | null;
  reviewCount: number;
  className?: string;
}

export function ProfileReputationWhy({
  badgePeriod,
  professionName,
  reviewCount,
  className,
}: ProfileReputationWhyProps) {
  const eligible = reviewCount >= MIN_REVIEWS_FOR_ELIGIBILITY;

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6",
        className,
      )}
      aria-labelledby="why-reputation-heading"
    >
      <SectionEyebrow id="why-reputation-heading" className="mb-4">
        Why this reputation
      </SectionEyebrow>
      <HowBadgeWorks
        reviewCount={reviewCount}
        badgePeriod={badgePeriod}
        professionName={professionName}
        eligible={eligible}
        borderClassName="border-0"
        className="pt-0"
      />
    </section>
  );
}
