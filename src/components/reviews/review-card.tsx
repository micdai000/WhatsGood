import { ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Muted, Paragraph } from "@/components/typography/typography";
import { StarRating } from "@/components/reviews/star-rating";
import { formatDate } from "@/lib/utils/format-date";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const formattedDate = formatDate(review.createdAt, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="space-y-3 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <Paragraph className="font-semibold">{review.reviewerName}</Paragraph>
            <div className="flex flex-wrap items-center gap-2">
              <StarRating rating={review.rating} size="sm" />
              {review.relationship ? (
                <Muted className="text-xs">{review.relationship}</Muted>
              ) : null}
            </div>
          </div>
          <Muted className="text-xs tabular-nums">{formattedDate}</Muted>
        </div>

        <div className="space-y-2">
          <Paragraph className="font-medium">{review.title}</Paragraph>
          <Paragraph className="text-sm leading-relaxed text-muted-foreground">
            {review.body}
          </Paragraph>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {review.wouldRecommend ? (
            <Badge variant="secondary" className="gap-1">
              <ThumbsUp className="size-3" aria-hidden />
              Would recommend
            </Badge>
          ) : (
            <Badge variant="outline">Would not recommend</Badge>
          )}
          {review.verified ? (
            <Badge variant="default">Verified</Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
