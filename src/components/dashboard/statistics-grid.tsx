import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { formatRating } from "@/lib/utils/format-rating";
import type { DashboardStatistics } from "@/types";
import { cn } from "@/lib/utils";

interface StatisticsGridProps {
  statistics: DashboardStatistics;
  className?: string;
}

function formatGrowthTrend(growth: DashboardStatistics["reviewGrowth"]): string | null {
  if (growth.changePercent === null) {
    return growth.last30Days > 0 ? "First reviews this month" : null;
  }

  const sign = growth.changePercent > 0 ? "+" : "";
  return `${sign}${growth.changePercent}% vs prior 30 days`;
}

export function StatisticsGrid({ statistics, className }: StatisticsGridProps) {
  const successRateLabel =
    statistics.reviewRequestSuccessRate !== null
      ? `${statistics.reviewRequestSuccessRate}%`
      : "—";

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
      role="list"
      aria-label="Key statistics"
    >
      <AnalyticsCard
        label="Average rating"
        value={formatRating(statistics.averageRating)}
        hint={`${statistics.totalReviews} total review${statistics.totalReviews === 1 ? "" : "s"}`}
      />
      <AnalyticsCard
        label="Reviews (last 30 days)"
        value={String(statistics.reviewGrowth.last30Days)}
        trend={formatGrowthTrend(statistics.reviewGrowth)}
      />
      <AnalyticsCard
        label="Pending requests"
        value={String(statistics.pendingReviewRequests)}
        hint="Awaiting client response"
      />
      <AnalyticsCard
        label="Completed requests"
        value={String(statistics.completedReviewRequests)}
        hint={`${statistics.totalReviewRequests} sent overall`}
      />
      <AnalyticsCard
        label="Request success rate"
        value={successRateLabel}
        hint="Completed ÷ (completed + expired)"
      />
      <AnalyticsCard
        label={statistics.profileViews.label}
        value="—"
        hint={statistics.profileViews.message}
        placeholder
      />
    </div>
  );
}
