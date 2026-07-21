import { ReviewCard } from "@/components/reviews/review-card";
import { Muted } from "@/components/typography/typography";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";

interface ReviewListProps {
  reviews: Review[];
  variant?: "default" | "compact";
  className?: string;
}

export function ReviewList({
  reviews,
  variant = "default",
  className,
}: ReviewListProps) {
  if (variant === "compact") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between gap-2 px-0.5">
          <Muted className="text-xs font-medium uppercase tracking-wide">
            Recent votes
          </Muted>
          <Muted className="text-[10px] tabular-nums">{reviews.length}</Muted>
        </div>
        <div className="rounded-2xl border border-border bg-card px-3 py-1 shadow-sm">
          <ul>
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} variant="compact" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <ul className={cn("space-y-3", className)}>
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard review={review} />
        </li>
      ))}
    </ul>
  );
}
