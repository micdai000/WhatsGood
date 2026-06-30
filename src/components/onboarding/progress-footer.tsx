import { cn } from "@/lib/utils";
import { Caption, Muted } from "@/components/typography/typography";

interface ProgressFooterProps {
  children?: React.ReactNode;
  hint?: string;
  className?: string;
}

export function ProgressFooter({
  children,
  hint,
  className,
}: ProgressFooterProps) {
  return (
    <footer className={cn("space-y-4 border-t border-border pt-6", className)}>
      {children}
      {hint ? <Caption className="block text-center">{hint}</Caption> : null}
      <Muted className="block text-center text-xs">
        You can complete setup in a few minutes. Your progress is saved as you go.
      </Muted>
    </footer>
  );
}
