import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ReviewForm } from "@/components/reviews/review-form";
import { PageTitle, Muted, Paragraph } from "@/components/typography/typography";
import { StatusAlert } from "@/components/ui/status-alert";
import { reviewRequestService } from "@/services/reviewRequests/review-request.service";
import { isFailure } from "@/types";

export const dynamic = "force-dynamic";

interface ReviewRequestPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: ReviewRequestPageProps): Promise<Metadata> {
  const { token } = await params;
  const result = await reviewRequestService.getRequestByToken(token);

  if (isFailure(result)) {
    return { title: "Review request | TrustLoop" };
  }

  return {
    title: `Review ${result.data.profileDisplayName} | TrustLoop`,
    description: `Share your experience with ${result.data.profileDisplayName}.`,
  };
}

export default async function ReviewRequestPage({ params }: ReviewRequestPageProps) {
  const { token } = await params;
  const result = await reviewRequestService.getRequestByToken(token);

  if (isFailure(result)) {
    const { code, message } = result.error;

    if (code === "NOT_FOUND") {
      notFound();
    }

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

  const request = result.data;

  return (
    <Section spacing="default">
      <Container size="narrow" className="space-y-8">
        <div>
          <PageTitle>Share your experience</PageTitle>
          <Muted className="mt-2 text-sm">
            You were invited to leave a review for {request.profileDisplayName}.
          </Muted>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-full border bg-muted">
            <div className="flex size-full items-center justify-center bg-primary/10 text-sm font-semibold text-primary">
              {request.profileDisplayName.slice(0, 1).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0">
            <Paragraph className="truncate font-semibold">
              {request.profileDisplayName}
            </Paragraph>
            <Muted className="text-sm">@{request.profileUsername}</Muted>
          </div>
        </div>

        <ReviewForm
          slug={request.profileUsername}
          displayName={request.profileDisplayName}
          requestToken={request.token}
          prefilledEmail={request.email}
          lockEmail
        />
      </Container>
    </Section>
  );
}
