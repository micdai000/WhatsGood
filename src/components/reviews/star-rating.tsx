import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
} as const;

export function StarRating({
  rating,
  max = 5,
  size = "md",
  className,
  label,
}: StarRatingProps) {
  const clamped = Math.min(Math.max(rating, 0), max);
  const fullStars = Math.floor(clamped);
  const hasHalf = clamped - fullStars >= 0.5;

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={label ?? `${clamped} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, index) => {
        const starNumber = index + 1;
        const filled = starNumber <= fullStars;
        const half = !filled && hasHalf && starNumber === fullStars + 1;

        return (
          <Star
            key={starNumber}
            className={cn(
              sizeClasses[size],
              filled || half
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/30",
              half && "opacity-80",
            )}
            aria-hidden
          />
        );
      })}
    </div>
  );
}
