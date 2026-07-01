import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Muted, Paragraph } from "@/components/typography/typography";
import { StarRating } from "@/components/reviews/star-rating";
import { formatRating } from "@/lib/utils/format-rating";
import { cn } from "@/lib/utils";

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  className?: string;
}

export function ReviewSummary({
  averageRating,
  totalReviews,
  className,
}: ReviewSummaryProps) {
  const reviewLabel =
    totalReviews === 1 ? "1 review" : `${totalReviews} reviews`;

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="flex flex-col items-center gap-2 py-6 text-center sm:flex-row sm:justify-center sm:gap-6 sm:text-left">
        <div className="flex items-center gap-2">
          <Star className="size-8 fill-amber-400 text-amber-400" aria-hidden />
          <Paragraph className="text-4xl font-bold tabular-nums">
            {formatRating(averageRating)}
          </Paragraph>
        </div>
        <div className="space-y-1">
          <StarRating rating={averageRating} size="lg" />
          <Muted className="text-sm">{reviewLabel}</Muted>
        </div>
      </CardContent>
    </Card>
  );
}
