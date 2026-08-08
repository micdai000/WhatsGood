import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import {
  ADMIN_TOTAL_VERIFIED_FEEDBACK,
  FEEDBACK_REQUESTS_SHORT,
} from "@/lib/copy/vocabulary";
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
      <AnalyticsCard
        label={ADMIN_TOTAL_VERIFIED_FEEDBACK}
        value={String(statistics.totalReviews)}
      />
      <AnalyticsCard
        label={`Pending ${FEEDBACK_REQUESTS_SHORT.toLowerCase()}`}
        value={String(statistics.pendingReviewRequests)}
      />
    </div>
  );
}
