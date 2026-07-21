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
      <aside className={cn("space-y-3", className)} aria-label="Recent votes">
        <div className="flex items-center justify-between gap-2">
          <Muted className="text-xs font-medium uppercase tracking-wide">
            Recent votes
          </Muted>
          <Muted className="text-[10px] tabular-nums">{reviews.length}</Muted>
        </div>
        <div className="rounded-xl border border-border/80 bg-card px-3 py-1 shadow-sm">
          <ul>
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} variant="compact" />
              </li>
            ))}
          </ul>
        </div>
      </aside>
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
