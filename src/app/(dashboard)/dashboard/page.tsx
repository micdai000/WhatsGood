import { Link, Navigate } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import {
  DashboardHeader,
  DashboardReputationPanel,
  EmptyDashboard,
  QuickActions,
  ReviewRequestCard,
} from "@/components/dashboard";
import { ReviewList } from "@/components/reviews/review-list";
import {
  COLLECT_FEEDBACK_EMPTY,
  CREATE_FEEDBACK_REQUEST_EMPTY,
  FEEDBACK_REQUESTS_SHORT,
  NO_CLIENT_FEEDBACK_YET,
  NO_FEEDBACK_REQUESTS_YET,
  RECENT_CLIENT_FEEDBACK,
} from "@/lib/copy/vocabulary";
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
    reputation,
    statistics,
    recentReviews,
    recentReviewRequests,
  } = dashboardResult.data;

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <DashboardHeader profile={profile} />

        <DashboardReputationPanel profile={profile} reputation={reputation} />

        <QuickActions profile={profile} />

        <section className="space-y-4" aria-labelledby="recent-reviews-heading">
          <div className="flex items-center justify-between gap-4">
            <h2 id="recent-reviews-heading" className="text-lg font-semibold">
              {RECENT_CLIENT_FEEDBACK}
            </h2>
            {statistics.totalReviews > RECENT_LIMIT ? (
              <Muted className="text-sm">Showing latest {RECENT_LIMIT}</Muted>
            ) : null}
          </div>

          {recentReviews.length > 0 ? (
            <ReviewList reviews={recentReviews} variant="compact" />
          ) : (
            <EmptyDashboard
              title={NO_CLIENT_FEEDBACK_YET}
              description={COLLECT_FEEDBACK_EMPTY}
            />
          )}
        </section>

        <section className="space-y-4" aria-labelledby="recent-requests-heading">
          <div className="flex items-center justify-between gap-4">
            <h2 id="recent-requests-heading" className="text-lg font-semibold">
              {FEEDBACK_REQUESTS_SHORT}
            </h2>
            <Link
              to="/dashboard/review-requests"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Manage requests
            </Link>
          </div>

          {recentReviewRequests.length > 0 ? (
            <ul className="grid gap-4">
              {recentReviewRequests.map((request) => (
                <li key={request.id}>
                  <ReviewRequestCard request={request} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyDashboard
              title={NO_FEEDBACK_REQUESTS_YET}
              description={CREATE_FEEDBACK_REQUEST_EMPTY}
            />
          )}
        </section>
      </Container>
    </Section>
  );
}
