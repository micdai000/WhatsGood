import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import {
  CreateReviewRequestForm,
  EmptyDashboard,
  ReviewRequestCard,
} from "@/components/dashboard";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthContext } from "@/contexts/auth-context";
import { useServiceQuery } from "@/hooks/use-service-query";
import { reviewRequestService } from "@/services/reviewRequests/review-request.service";

export default function ReviewRequestsPage() {
  const { user } = useAuthContext();
  const requestsResult = useServiceQuery(
    () =>
      reviewRequestService.getRequestsForProfile(user!.id, {
        page: 1,
        limit: 50,
      }),
    [user?.id],
  );

  if (requestsResult.status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (requestsResult.status === "error") {
    throw new Error(requestsResult.message);
  }

  const requests = requestsResult.data.items;

  return (
    <Section>
      <Container className="space-y-8">
        <div>
          <Link
            to="/dashboard"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "-ml-2 mb-4 inline-flex",
            })}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to dashboard
          </Link>
          <PageHeader
            title="Review requests"
            description="Generate unique links for clients. Copy and share them manually — no email is sent yet."
          />
        </div>

        <CreateReviewRequestForm />

        <section className="space-y-4" aria-labelledby="all-requests-heading">
          <h2 id="all-requests-heading" className="text-lg font-semibold">
            All requests
          </h2>

          {requests.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {requests.map((request) => (
                <li key={request.id}>
                  <ReviewRequestCard request={request} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyDashboard
              title="No requests yet"
              description="Enter a client email above to generate your first review link."
            />
          )}
        </section>
      </Container>
    </Section>
  );
}
