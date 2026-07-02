import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { formatRating } from "@/lib/utils/format-rating";
import type { AdminDashboardStats } from "@/types";

interface AdminStatGridProps {
  statistics: AdminDashboardStats;
}

export function AdminStatGrid({ statistics }: AdminStatGridProps) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      role="list"
      aria-label="Platform statistics"
    >
      <AnalyticsCard label="Total users" value={String(statistics.totalUsers)} />
      <AnalyticsCard label="Total profiles" value={String(statistics.totalProfiles)} />
      <AnalyticsCard label="Total reviews" value={String(statistics.totalReviews)} />
      <AnalyticsCard
        label="Pending requests"
        value={String(statistics.pendingReviewRequests)}
      />
      <AnalyticsCard
        label="Average platform rating"
        value={formatRating(statistics.averagePlatformRating)}
      />
    </div>
  );
}
