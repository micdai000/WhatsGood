import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyAnalytics } from "@/components/dashboard/empty-analytics";
import { RatingBreakdown } from "@/components/reviews/rating-breakdown";
import type { RatingBreakdown as RatingBreakdownData } from "@/types";
import { cn } from "@/lib/utils";

interface RatingDistributionProps {
  distribution: RatingBreakdownData;
  className?: string;
}

export function RatingDistribution({
  distribution,
  className,
}: RatingDistributionProps) {
  return (
    <DashboardCard title="Rating distribution" className={className}>
      {distribution.total > 0 ? (
        <RatingBreakdown breakdown={distribution} />
      ) : (
        <EmptyAnalytics
          title="No ratings yet"
          description="Distribution appears after your first review."
        />
      )}
    </DashboardCard>
  );
}
