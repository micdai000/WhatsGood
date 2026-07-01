import { Muted, Paragraph } from "@/components/typography/typography";
import { StarRating } from "@/components/reviews/star-rating";
import type { RatingBreakdown } from "@/types";
import { cn } from "@/lib/utils";

interface RatingBreakdownProps {
  breakdown: RatingBreakdown;
  className?: string;
}

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

export function RatingBreakdown({ breakdown, className }: RatingBreakdownProps) {
  if (breakdown.total === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Paragraph className="text-sm font-medium">Rating breakdown</Paragraph>
      <ul className="space-y-2">
        {STAR_LEVELS.map((stars) => {
          const count = breakdown.counts[stars];
          const percentage =
            breakdown.total > 0 ? Math.round((count / breakdown.total) * 100) : 0;

          return (
            <li key={stars} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-sm tabular-nums">{stars}</span>
                <StarRating rating={1} max={1} size="sm" aria-hidden />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${percentage}%` }}
                  role="presentation"
                />
              </div>
              <Muted className="text-right text-xs tabular-nums">{count}</Muted>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
