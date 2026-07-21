import { PenLine } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  BadgeHistoryStrip,
  TierHistoryBreakdown,
  TrustBadgeSummary,
} from "@/components/badges";
import { SectionHeader } from "@/components/ui/section-header";
import { Spinner } from "@/components/ui/spinner";
import { EmptyReviews } from "@/components/reviews";
import { buttonVariants } from "@/components/ui/button";
import { badgeService } from "@/services/badges";
import { profileService } from "@/services/profiles/profile.service";
import type { BadgeSnapshot, BadgeSubTier, BadgeTier } from "@/types";
import { isFailure } from "@/types";

const BADGE_HISTORY_LIMIT = 12;

interface ProfileReviewsSectionProps {
  slug: string;
  displayName: string;
  professionName: string | null;
  badgeTier: BadgeTier;
  badgeSubTier?: BadgeSubTier | null;
  badgePeriod: string | null;
  totalReviews: number;
}

export function ProfileReviewsSection({
  slug,
  displayName,
  professionName,
  badgeTier,
  badgeSubTier = null,
  badgePeriod,
  totalReviews,
}: ProfileReviewsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [badgeHistory, setBadgeHistory] = useState<BadgeSnapshot[]>([]);
  const [latestSnapshot, setLatestSnapshot] = useState<BadgeSnapshot | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);

      const profileResult = await profileService.getProfileBySlug(slug);
      if (cancelled) return;

      if (isFailure(profileResult)) {
        if (profileResult.error.code === "NOT_FOUND") {
          setNotFound(true);
        }
        setLoading(false);
        return;
      }

      const profileId = profileResult.data.id;
      const historyResult = await badgeService.getBadgeHistory(
        profileId,
        BADGE_HISTORY_LIMIT,
      );

      if (cancelled) return;

      const history = isFailure(historyResult) ? [] : historyResult.data;
      setBadgeHistory(history);
      setLatestSnapshot(history[0] ?? null);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const leaveReviewHref = `/review/${slug}`;
  const hasReviews = totalReviews > 0;
  const reviewCountWindow =
    latestSnapshot?.componentBreakdown.review_count_window ?? totalReviews;
  const eligible = latestSnapshot?.eligible ?? false;

  return (
    <section className="space-y-6" aria-labelledby="reviews-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionHeader
            title="Reviews"
            subtitle={
              hasReviews
                ? `What clients say about ${displayName}`
                : `Reviews for ${displayName}`
            }
          />
        </div>
        <Link
          to={leaveReviewHref}
          className={buttonVariants({
            size: "lg",
            className:
              "w-full gap-2 px-6 text-base font-semibold shadow-md ring-2 ring-primary/25 sm:w-auto",
          })}
        >
          <PenLine className="size-5" aria-hidden />
          Leave a review
        </Link>
      </div>

      {hasReviews ? (
        <div className="space-y-6">
          <TrustBadgeSummary
            badgeTier={badgeTier}
            badgeSubTier={badgeSubTier}
            badgePeriod={badgePeriod}
            professionName={professionName}
            reviewCountWindow={reviewCountWindow}
            eligible={eligible}
          />
          <BadgeHistoryStrip history={badgeHistory} />
          <TierHistoryBreakdown history={badgeHistory} />
        </div>
      ) : (
        <div className="space-y-6">
          <TrustBadgeSummary
            badgeTier={badgeTier}
            badgeSubTier={badgeSubTier}
            badgePeriod={badgePeriod}
            professionName={professionName}
            reviewCountWindow={reviewCountWindow}
            eligible={eligible}
          />
          <EmptyReviews
            displayName={displayName}
            leaveReviewHref={leaveReviewHref}
          />
        </div>
      )}
    </section>
  );
}
