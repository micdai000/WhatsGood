import { ReviewCard } from "@/components/reviews/review-card";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";

interface ReviewListProps {
  reviews: Review[];
  className?: string;
}

export function ReviewList({ reviews, className }: ReviewListProps) {
  return (
    <ul className={cn("space-y-4", className)}>
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard review={review} />
        </li>
      ))}
    </ul>
  );
}
