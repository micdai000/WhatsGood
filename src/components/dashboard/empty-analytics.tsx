import { BarChart3 } from "lucide-react";
import { Muted, Paragraph } from "@/components/typography/typography";
import { cn } from "@/lib/utils";

interface EmptyAnalyticsProps {
  title: string;
  description: string;
  className?: string;
}

export function EmptyAnalytics({
  title,
  description,
  className,
}: EmptyAnalyticsProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 py-8 text-center",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <BarChart3 className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-1">
        <Paragraph className="text-sm font-medium">{title}</Paragraph>
        <Muted className="max-w-xs text-xs">{description}</Muted>
      </div>
    </div>
  );
}
