import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { LeaveReviewShell } from "@/components/reviews/leave-review-shell";
import { ReviewForm } from "@/components/reviews/review-form";
import { PageTitle } from "@/components/typography/typography";
import { StatusAlert } from "@/components/ui/status-alert";
import { Spinner } from "@/components/ui/spinner";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { reviewRequestService } from "@/services/reviewRequests/review-request.service";
import { isFailure } from "@/types";
import type { ReviewRequest } from "@/types";

type RequestData = ReviewRequest & {
  profileUsername: string;
  profileDisplayName: string;
};

type PageState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "error"; code: string; message: string }
  | { status: "success"; data: RequestData };

export default function ReviewRequestPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setState({ status: "loading" });

    reviewRequestService.getRequestByToken(token).then((result) => {
      if (cancelled) return;

      if (isFailure(result)) {
        const { code, message } = result.error;
        if (code === "NOT_FOUND") {
          setState({ status: "not_found" });
          return;
        }
        setState({ status: "error", code, message });
        return;
      }

      setState({ status: "success", data: result.data });
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-muted/60">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (state.status === "not_found") {
    return <Navigate to="/" replace />;
  }

  if (state.status === "error") {
    const { code, message } = state;
    return (
      <Section spacing="default">
        <Container size="narrow" className="space-y-6">
          <PageTitle>Review link unavailable</PageTitle>
          <StatusAlert
            status="error"
            title={
              code === "EXPIRED"
                ? "This link has expired"
                : code === "ALREADY_COMPLETED"
                  ? "Review already submitted"
                  : "Invalid review link"
            }
            description={message}
          />
        </Container>
      </Section>
    );
  }

  const request = state.data;

  return (
    <LeaveReviewShell
      title="Share your trust vote"
      description={`You were invited to weigh in on ${request.profileDisplayName}'s monthly badge standing.`}
      profile={{
        displayName: request.profileDisplayName,
        avatar: null,
        meta: `@${request.profileUsername}`,
      }}
    >
      <ReviewForm
        slug={request.profileUsername}
        displayName={request.profileDisplayName}
        requestToken={request.token}
        prefilledEmail={request.email}
        lockEmail
      />
    </LeaveReviewShell>
  );
}
