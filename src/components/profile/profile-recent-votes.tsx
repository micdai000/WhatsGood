import { useEffect, useState } from "react";
import { ReviewList } from "@/components/reviews";
import { Muted, SectionEyebrow } from "@/components/typography/typography";
import { RECENT_CLIENT_FEEDBACK } from "@/lib/copy/vocabulary";
import { REPUTATION_RECENCY_WINDOW } from "@/lib/badges/reputation-copy";
import { Spinner } from "@/components/ui/spinner";
import { profileService } from "@/services/profiles/profile.service";
import { reviewService } from "@/services/reviews/review.service";
import type { Review } from "@/types";
import { isFailure } from "@/types";
import { cn } from "@/lib/utils";

const RECENT_REVIEWS_LIMIT = 5;

interface ProfileRecentVotesProps {
  slug: string;
  displayName: string;
  totalReviews: number;
  className?: string;
}

export function ProfileRecentVotes({
  slug,
  displayName,
  totalReviews,
  className,
}: ProfileRecentVotesProps) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (totalReviews === 0) {
      setReviews([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);

      const profileResult = await profileService.getProfileBySlug(slug);
      if (cancelled) return;

      if (isFailure(profileResult)) {
        setReviews([]);
        setLoading(false);
        return;
      }

      const reviewsResult = await reviewService.getReviews(profileResult.data.id, {
        page: 1,
        limit: RECENT_REVIEWS_LIMIT,
      });

      if (cancelled) return;

      setReviews(isFailure(reviewsResult) ? [] : reviewsResult.data.items);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug, totalReviews]);

  return (
    <aside
      className={cn("min-w-0 space-y-3", className)}
      aria-labelledby="recent-feedback-heading"
    >
      <SectionEyebrow id="recent-feedback-heading">
        {RECENT_CLIENT_FEEDBACK}
      </SectionEyebrow>
      <Muted className="text-xs leading-relaxed">
        Recent verified experiences from the {REPUTATION_RECENCY_WINDOW}
      </Muted>
      {totalReviews === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-center">
          <Muted className="text-xs leading-relaxed">
            Be the first to share verified client feedback for {displayName}.
          </Muted>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <Spinner className="h-5 w-5" />
        </div>
      ) : reviews.length > 0 ? (
        <ReviewList reviews={reviews} variant="compact" />
      ) : null}
    </aside>
  );
}
