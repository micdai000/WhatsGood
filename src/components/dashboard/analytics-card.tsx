import { Card, CardContent } from "@/components/ui/card";
import { Muted, Paragraph } from "@/components/typography/typography";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  label: string;
  value: string;
  hint?: string;
  trend?: string | null;
  placeholder?: boolean;
  className?: string;
}

export function AnalyticsCard({
  label,
  value,
  hint,
  trend,
  placeholder = false,
  className,
}: AnalyticsCardProps) {
  return (
    <Card className={cn("shadow-sm", placeholder && "border-dashed", className)}>
      <CardContent className="space-y-2 py-5">
        <Muted className="text-xs uppercase tracking-wide">{label}</Muted>
        <Paragraph
          className={cn(
            "text-2xl font-bold tabular-nums sm:text-3xl",
            placeholder && "text-muted-foreground",
          )}
        >
          {value}
        </Paragraph>
        {trend ? (
          <Muted className="text-xs font-medium text-foreground">{trend}</Muted>
        ) : null}
        {hint ? <Muted className="text-xs">{hint}</Muted> : null}
      </CardContent>
    </Card>
  );
}
