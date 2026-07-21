import { useEffect, useState } from "react";
import { ReviewList } from "@/components/reviews";
import { Spinner } from "@/components/ui/spinner";
import { profileService } from "@/services/profiles/profile.service";
import { reviewService } from "@/services/reviews/review.service";
import type { Review } from "@/types";
import { isFailure } from "@/types";
import { cn } from "@/lib/utils";

const RECENT_REVIEWS_LIMIT = 5;

interface ProfileVotesSidebarProps {
  slug: string;
  totalReviews: number;
  className?: string;
}

export function ProfileVotesSidebar({
  slug,
  totalReviews,
  className,
}: ProfileVotesSidebarProps) {
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

  if (totalReviews === 0) {
    return null;
  }

  if (loading) {
    return (
      <aside className={cn("flex justify-center py-8", className)}>
        <Spinner className="h-6 w-6" />
      </aside>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <ReviewList
      reviews={reviews}
      variant="compact"
      className={className}
    />
  );
}
