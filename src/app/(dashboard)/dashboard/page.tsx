import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquarePlus, ExternalLink } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import {
  CopyLinkButton,
  DashboardCard,
  EmptyDashboard,
  QuickActionCard,
  ReviewRequestCard,
  StatCard,
} from "@/components/dashboard";
import { ReviewCard } from "@/components/reviews/review-card";
import { Paragraph, Muted } from "@/components/typography/typography";
import { buttonVariants } from "@/components/ui/button";
import { authService } from "@/services/auth/auth.service";
import { profileService } from "@/services/profiles/profile.service";
import { reviewService } from "@/services/reviews/review.service";
import { reviewRequestService } from "@/services/reviewRequests/review-request.service";
import { getPublicProfileUrl } from "@/lib/profile/public-url";
import { formatRating } from "@/lib/utils/format-rating";
import { isFailure, isSuccess } from "@/types";

export const dynamic = "force-dynamic";

const RECENT_LIMIT = 5;

export default async function DashboardPage() {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    redirect("/login");
  }

  const userId = sessionResult.data.user.id;
  const profileResult = await profileService.getProfile(userId);

  if (isFailure(profileResult)) {
    redirect("/welcome");
  }

  const profile = profileResult.data;
  const publicUrl = getPublicProfileUrl(profile.username);
  const firstName = profile.displayName.split(" ")[0];

  const [ratingResult, reviewsResult, requestsResult] = await Promise.all([
    reviewService.getAverageRating(userId),
    reviewService.getReviews(userId, { page: 1, limit: RECENT_LIMIT }),
    reviewRequestService.getRequestsForProfile(userId, {
      page: 1,
      limit: RECENT_LIMIT,
    }),
  ]);

  const averageRating = isSuccess(ratingResult)
    ? ratingResult.data.average
    : 0;
  const totalReviews = isSuccess(ratingResult) ? ratingResult.data.total : 0;
  const recentReviews = isSuccess(reviewsResult) ? reviewsResult.data.items : [];
  const recentRequests = isSuccess(requestsResult)
    ? requestsResult.data.items
    : [];

  return (
    <Section>
      <Container className="space-y-8">
        <PageHeader
          title={`Welcome, ${firstName}`}
          description="Manage your profile, reviews, and client review requests."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Average rating"
            value={formatRating(averageRating)}
          />
          <StatCard label="Total reviews" value={String(totalReviews)} />
          <StatCard
            label="Pending requests"
            value={String(
              recentRequests.filter((request) => request.status === "pending")
                .length,
            )}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardCard title="Your public profile">
            <div className="space-y-4">
              <Paragraph className="break-all text-sm font-medium">{publicUrl}</Paragraph>
              <div className="flex flex-wrap gap-3">
                <CopyLinkButton url={publicUrl} label="Copy profile link" />
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <ExternalLink className="size-4" aria-hidden />
                  View profile
                </a>
              </div>
            </div>
          </DashboardCard>

          <QuickActionCard
            title="Request a review"
            description="Generate a unique link to send to a client. Share it manually — email delivery comes later."
            href="/dashboard/review-requests"
            icon={MessageSquarePlus}
          />
        </div>

        <section className="space-y-4" aria-labelledby="recent-reviews-heading">
          <div className="flex items-center justify-between gap-4">
            <h2 id="recent-reviews-heading" className="text-lg font-semibold">
              Recent reviews
            </h2>
            {totalReviews > RECENT_LIMIT ? (
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
              href="/dashboard/review-requests"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>

          {recentRequests.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {recentRequests.map((request) => (
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
      </Container>
    </Section>
  );
}
