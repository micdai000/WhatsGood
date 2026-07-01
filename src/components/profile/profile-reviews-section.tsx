import { notFound } from "next/navigation";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import {
  EmptyReviews,
  RatingBreakdown,
  ReviewList,
  ReviewSummary,
} from "@/components/reviews";
import { buttonVariants } from "@/components/ui/button";
import { profileService } from "@/services/profiles/profile.service";
import { reviewService } from "@/services/reviews/review.service";
import { isFailure } from "@/types";

const RECENT_REVIEWS_LIMIT = 5;

interface ProfileReviewsSectionProps {
  slug: string;
  displayName: string;
  averageRating: number;
  totalReviews: number;
}

export async function ProfileReviewsSection({
  slug,
  displayName,
  averageRating,
  totalReviews,
}: ProfileReviewsSectionProps) {
  const profileResult = await profileService.getProfileBySlug(slug);

  if (isFailure(profileResult)) {
    if (profileResult.error.code === "NOT_FOUND") {
      notFound();
    }
    throw new Error(profileResult.error.message);
  }

  const profileId = profileResult.data.id;
  const leaveReviewHref = `/review/${slug}`;

  const [reviewsResult, breakdownResult] = await Promise.all([
    reviewService.getReviews(profileId, { page: 1, limit: RECENT_REVIEWS_LIMIT }),
    reviewService.getRatingBreakdown(profileId),
  ]);

  if (isFailure(reviewsResult)) {
    throw new Error(reviewsResult.error.message);
  }

  const breakdown = isFailure(breakdownResult) ? null : breakdownResult.data;
  const reviews = reviewsResult.data.items;
  const hasReviews = totalReviews > 0;

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
          href={leaveReviewHref}
          className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
        >
          Leave a review
        </Link>
      </div>

      {hasReviews ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,16rem)_1fr]">
          <div className="space-y-6">
            <ReviewSummary
              averageRating={averageRating}
              totalReviews={totalReviews}
            />
            {breakdown ? <RatingBreakdown breakdown={breakdown} /> : null}
          </div>
          <ReviewList reviews={reviews} />
        </div>
      ) : (
        <EmptyReviews
          displayName={displayName}
          leaveReviewHref={leaveReviewHref}
        />
      )}
    </section>
  );
}
