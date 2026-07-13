import { Muted } from "@/components/typography/typography";
import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  value: string;
  maxLength: number;
  className?: string;
}

export function CharacterCounter({
  value,
  maxLength,
  className,
}: CharacterCounterProps) {
  const remaining = maxLength - value.length;
  const isNearLimit = remaining <= 50;

  return (
    <Muted
      className={cn(
        "text-right text-xs tabular-nums",
        isNearLimit && remaining >= 0 && "text-amber-600 dark:text-amber-400",
        remaining < 0 && "text-destructive",
        className,
      )}
      aria-live="polite"
    >
      {value.length}/{maxLength}
    </Muted>
  );
}
