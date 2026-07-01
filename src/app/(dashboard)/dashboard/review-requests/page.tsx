import Link from "next/link";
import { redirect } from "next/navigation";
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
import { authService } from "@/services/auth/auth.service";
import { reviewRequestService } from "@/services/reviewRequests/review-request.service";
import { isFailure, isSuccess } from "@/types";

export const dynamic = "force-dynamic";

export default async function ReviewRequestsPage() {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    redirect("/login");
  }

  const userId = sessionResult.data.user.id;
  const requestsResult = await reviewRequestService.getRequestsForProfile(userId, {
    page: 1,
    limit: 50,
  });

  if (isFailure(requestsResult)) {
    throw new Error(requestsResult.error.message);
  }

  const requests = requestsResult.data.items;

  return (
    <Section>
      <Container className="space-y-8">
        <div>
          <Link
            href="/dashboard"
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
