import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  disabled?: boolean;
  className?: string;
  error?: string | null;
}

export function StarRatingInput({
  value,
  onChange,
  max = 5,
  disabled = false,
  className,
  error,
}: StarRatingInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Overall rating"
        aria-invalid={Boolean(error)}
      >
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1;
          const selected = starValue <= value;

          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={value === starValue}
              aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
              disabled={disabled}
              onClick={() => onChange(starValue)}
              className={cn(
                "rounded-md p-1 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "hover:scale-105 active:scale-95",
              )}
            >
              <Star
                className={cn(
                  "size-8 sm:size-9",
                  selected
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted-foreground/30",
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
