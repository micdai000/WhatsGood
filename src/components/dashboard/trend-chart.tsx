import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyAnalytics } from "@/components/dashboard/empty-analytics";
import { Muted } from "@/components/typography/typography";
import type { ReviewTrend } from "@/types";
import { cn } from "@/lib/utils";

interface TrendChartProps {
  trend: ReviewTrend;
  className?: string;
}

export function TrendChart({ trend, className }: TrendChartProps) {
  const maxCount = Math.max(...trend.points.map((point) => point.count), 1);

  if (trend.totalInPeriod === 0) {
    return (
      <DashboardCard title="Reviews over time">
        <EmptyAnalytics
          title="No reviews in this period"
          description="Reviews will appear here as clients leave feedback."
        />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Reviews over time">
      <div className={cn("space-y-4", className)}>
        <Muted className="text-xs">
          Last {trend.periodWeeks} weeks · {trend.totalInPeriod} review
          {trend.totalInPeriod === 1 ? "" : "s"}
        </Muted>
        <ul
          className="flex h-40 items-end gap-2"
          aria-label="Weekly review counts"
        >
          {trend.points.map((point) => {
            const heightPercent = Math.round((point.count / maxCount) * 100);

            return (
              <li
                key={point.date}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <div className="flex h-32 w-full items-end justify-center">
                  <div
                    className="w-full max-w-8 rounded-t-md bg-primary/80 transition-all"
                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    role="img"
                    aria-label={`${point.count} reviews for week of ${point.label}`}
                  />
                </div>
                <Muted className="truncate text-[10px] tabular-nums">
                  {point.label}
                </Muted>
              </li>
            );
          })}
        </ul>
      </div>
    </DashboardCard>
  );
}
