import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { formatVerifiedExperienceCount } from "@/lib/badges/reputation-copy";
import {
  RECENT_PERFORMANCE,
  VERIFIED_CLIENT_FEEDBACK,
  VERIFIED_EXPERIENCES,
} from "@/lib/copy/vocabulary";
import type { DashboardStatistics } from "@/types";
import { cn } from "@/lib/utils";

interface StatisticsGridProps {
  statistics: DashboardStatistics;
  className?: string;
}

function formatGrowthTrend(growth: DashboardStatistics["reviewGrowth"]): string | null {
  if (growth.changePercent === null) {
    return growth.last30Days > 0 ? "First verified experiences this month" : null;
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
        label={VERIFIED_EXPERIENCES}
        value={String(statistics.totalReviews)}
        hint={formatVerifiedExperienceCount(statistics.totalReviews)}
      />
      <AnalyticsCard
        label={RECENT_PERFORMANCE}
        value={String(statistics.reviewGrowth.last30Days)}
        trend={formatGrowthTrend(statistics.reviewGrowth)}
        hint="Verified client feedback in the last 30 days"
      />
      <AnalyticsCard
        label="Pending feedback links"
        value={String(statistics.pendingReviewRequests)}
        hint="Awaiting client response"
      />
      <AnalyticsCard
        label="Completed feedback links"
        value={String(statistics.completedReviewRequests)}
        hint={`${statistics.totalReviewRequests} sent overall`}
      />
      <AnalyticsCard
        label="Link completion rate"
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
