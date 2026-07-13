import { Link, Navigate } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import {
  ActivityFeed,
  DashboardHeader,
  EmptyDashboard,
  QuickActions,
  RatingDistribution,
  ReviewRequestCard,
  StatisticsGrid,
  TrendChart,
} from "@/components/dashboard";
import { ReviewCard } from "@/components/reviews/review-card";
import { Muted } from "@/components/typography/typography";
import { Spinner } from "@/components/ui/spinner";
import { useAuthContext } from "@/contexts/auth-context";
import { useServiceQuery } from "@/hooks/use-service-query";
import { dashboardService } from "@/services/dashboard";

const RECENT_LIMIT = 5;

export default function DashboardPage() {
  const { user } = useAuthContext();
  const dashboardResult = useServiceQuery(
    () => dashboardService.getDashboard(user!.id),
    [user?.id],
  );

  if (dashboardResult.status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (dashboardResult.status === "error") {
    return <Navigate to="/welcome" replace />;
  }

  const {
    profile,
    statistics,
    recentReviews,
    recentReviewRequests,
    recentActivity,
    reviewTrend,
    ratingDistribution,
  } = dashboardResult.data;

  return (
    <Section>
      <Container className="space-y-8">
        <DashboardHeader profile={profile} />

        <StatisticsGrid statistics={statistics} />

        <QuickActions profile={profile} />

        <section
          className="grid gap-4 lg:grid-cols-2"
          aria-label="Analytics charts"
        >
          <TrendChart trend={reviewTrend} />
          <RatingDistribution distribution={ratingDistribution} />
        </section>

        <section className="space-y-4" aria-labelledby="recent-reviews-heading">
          <div className="flex items-center justify-between gap-4">
            <h2 id="recent-reviews-heading" className="text-lg font-semibold">
              Recent reviews
            </h2>
            {statistics.totalReviews > RECENT_LIMIT ? (
              <Muted className="text-sm">Showing latest {RECENT_LIMIT}</Muted>
            ) : null}
          </div>

          {recentReviews.length > 0 ? (
            <ul className="space-y-4">
              {recentReviews.map((review) => (
                <li key={review.id}>
                  <ReviewCard review={review} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyDashboard
              title="No reviews yet"
              description="Share your profile or send a review request to start collecting feedback."
            />
          )}
        </section>

        <section className="space-y-4" aria-labelledby="recent-requests-heading">
          <div className="flex items-center justify-between gap-4">
            <h2 id="recent-requests-heading" className="text-lg font-semibold">
              Recent review requests
            </h2>
            <Link
              to="/dashboard/review-requests"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>

          {recentReviewRequests.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {recentReviewRequests.map((request) => (
                <li key={request.id}>
                  <ReviewRequestCard request={request} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyDashboard
              title="No review requests yet"
              description="Create a review request to get a shareable link for your client."
            />
          )}
        </section>

        {recentActivity.length > 0 ? (
          <ActivityFeed items={recentActivity} />
        ) : null}
      </Container>
    </Section>
  );
}
