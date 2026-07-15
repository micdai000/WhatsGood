import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ReviewForm } from "@/components/reviews/review-form";
import { buttonVariants } from "@/components/ui/button";
import { PageTitle, Muted, Paragraph } from "@/components/typography/typography";
import { StatusAlert } from "@/components/ui/status-alert";
import { Spinner } from "@/components/ui/spinner";
import { useServiceQuery } from "@/hooks/use-service-query";
import { getPublicProfileUrl } from "@/lib/profile/public-url";
import { profileService } from "@/services/profiles/profile.service";

export default function LeaveReviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const result = useServiceQuery(
    () => profileService.getPublicProfile(slug!),
    [slug],
  );

  if (result.status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (result.status === "error") {
    return <Navigate to="/" replace />;
  }

  const profile = result.data;
  const profileUrl = getPublicProfileUrl(profile.username);

  return (
    <Section spacing="default">
      <Container size="narrow" className="space-y-8">
        <div>
          <Link
            to={profileUrl}
            className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-2 mb-4 inline-flex" })}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to profile
          </Link>

          <PageTitle>Leave a review</PageTitle>
          <Muted className="mt-2 text-sm">
            Your honest feedback helps others find trusted professionals.
          </Muted>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-full border bg-muted">
            {profile.avatar ? (
              <AppImage
                src={profile.avatar}
                alt={`${profile.displayName}'s profile photo`}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-primary/10 text-sm font-semibold text-primary">
                {profile.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Paragraph className="truncate font-semibold">{profile.displayName}</Paragraph>
            {profile.professionName ? (
              <Muted className="text-sm">{profile.professionName}</Muted>
            ) : null}
          </div>
        </div>

        {!profile.isComplete ? (
          <StatusAlert
            status="warning"
            title="Profile still being set up"
            description="This professional hasn't finished their profile yet, but you can still leave a review."
          />
        ) : null}

        <ReviewForm slug={profile.username} displayName={profile.displayName} />
      </Container>
    </Section>
  );
}
