import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Muted } from "@/components/typography/typography";

interface LoadingStateProps {
  label?: string;
  className?: string;
  fullPage?: boolean;
}

export function LoadingState({
  label = "Loading…",
  className,
  fullPage = false,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        fullPage && "min-h-[50dvh]",
        className,
      )}
    >
      <Spinner className="size-6 text-muted-foreground" />
      <Muted>{label}</Muted>
    </div>
  );
}
