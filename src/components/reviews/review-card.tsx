import { Badge } from "@/components/ui/badge";
import { Muted } from "@/components/typography/typography";
import { TrustVoteBadge } from "@/components/reviews/trust-vote-badge";
import { formatDate } from "@/lib/utils/format-date";
import { isTrustVotePlaceholder } from "@/lib/reviews/trust-signals";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
  variant?: "default" | "compact";
  className?: string;
}

export function ReviewCard({
  review,
  variant = "default",
  className,
}: ReviewCardProps) {
  const formattedDate = formatDate(review.createdAt, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const isTrustVote = isTrustVotePlaceholder(review);

  if (variant === "compact") {
    return (
      <article
        className={cn(
          "flex items-start gap-2 border-b border-border/60 py-2.5 last:border-0",
          className,
        )}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-xs font-medium text-foreground">
            {review.reviewerName}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <TrustVoteBadge
              rating={review.rating}
              className="px-1.5 py-0 text-[10px]"
            />
            {review.verified ? (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                Verified
              </Badge>
            ) : null}
          </div>
          {review.relationship ? (
            <Muted className="truncate text-[10px]">{review.relationship}</Muted>
          ) : null}
        </div>
        <Muted className="shrink-0 text-[10px] tabular-nums">{formattedDate}</Muted>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "rounded-xl border border-border/80 bg-card px-4 py-3 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-semibold">{review.reviewerName}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <TrustVoteBadge
              rating={review.rating}
              className="px-1.5 py-0 text-[10px]"
            />
            {review.verified ? (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                Verified
              </Badge>
            ) : null}
          </div>
        </div>
        <Muted className="shrink-0 text-[10px] tabular-nums">{formattedDate}</Muted>
      </div>

      {review.relationship ? (
        <Muted className="mt-1 text-[10px]">{review.relationship}</Muted>
      ) : null}

      {!isTrustVote ? (
        <div className="mt-2 space-y-1">
          <p className="text-sm font-medium">{review.title}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {review.body}
          </p>
        </div>
      ) : null}
    </article>
  );
}
