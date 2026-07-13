import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { BadgeHistoryStrip, TrustBadgeSummary } from "@/components/badges";
import { SectionHeader } from "@/components/ui/section-header";
import { Spinner } from "@/components/ui/spinner";
import {
  EmptyReviews,
  RatingBreakdown,
  ReviewList,
} from "@/components/reviews";
import { buttonVariants } from "@/components/ui/button";
import { badgeService } from "@/services/badges";
import { profileService } from "@/services/profiles/profile.service";
import { reviewService } from "@/services/reviews/review.service";
import type {
  BadgeSnapshot,
  BadgeTier,
  RatingBreakdown as RatingBreakdownType,
  Review,
} from "@/types";
import { isFailure } from "@/types";

const RECENT_REVIEWS_LIMIT = 5;
const BADGE_HISTORY_LIMIT = 12;

interface ProfileReviewsSectionProps {
  slug: string;
  displayName: string;
  professionName: string | null;
  badgeTier: BadgeTier;
  badgePeriod: string | null;
  totalReviews: number;
}

export function ProfileReviewsSection({
  slug,
  displayName,
  professionName,
  badgeTier,
  badgePeriod,
  totalReviews,
}: ProfileReviewsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [breakdown, setBreakdown] = useState<RatingBreakdownType | null>(null);
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
      const [reviewsResult, breakdownResult, historyResult] = await Promise.all([
        reviewService.getReviews(profileId, {
          page: 1,
          limit: RECENT_REVIEWS_LIMIT,
        }),
        reviewService.getRatingBreakdown(profileId),
        badgeService.getBadgeHistory(profileId, BADGE_HISTORY_LIMIT),
      ]);

      if (cancelled) return;

      setReviews(isFailure(reviewsResult) ? [] : reviewsResult.data.items);
      setBreakdown(isFailure(breakdownResult) ? null : breakdownResult.data);
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
            variant: "outline",
            className: "w-full sm:w-auto",
          })}
        >
          Leave a review
        </Link>
      </div>

      <BadgeHistoryStrip history={badgeHistory} />

      {hasReviews ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,16rem)_1fr]">
          <div className="space-y-6">
            <TrustBadgeSummary
              badgeTier={badgeTier}
              badgePeriod={badgePeriod}
              professionName={professionName}
              reviewCountWindow={reviewCountWindow}
              eligible={eligible}
            />
            {breakdown ? <RatingBreakdown breakdown={breakdown} /> : null}
          </div>
          <ReviewList reviews={reviews} />
        </div>
      ) : (
        <div className="space-y-6">
          <TrustBadgeSummary
            badgeTier={badgeTier}
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
