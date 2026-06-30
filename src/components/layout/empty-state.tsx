import { cn } from "@/lib/utils";
import { H3, Muted } from "@/components/typography/typography";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <H3 as="h2" className="text-lg">
        {title}
      </H3>
      {description ? <Muted className="mt-2 max-w-sm">{description}</Muted> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
