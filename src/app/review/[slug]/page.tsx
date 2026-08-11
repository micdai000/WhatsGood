import { Navigate, useParams } from "react-router-dom";
import { LeaveReviewShell } from "@/components/reviews/leave-review-shell";
import { ReviewForm } from "@/components/reviews/review-form";
import { Spinner } from "@/components/ui/spinner";
import { useServiceQuery } from "@/hooks/use-service-query";
import { getPublicProfilePath } from "@/lib/profile/public-url";
import { profileService } from "@/services/profiles/profile.service";

export default function LeaveReviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const result = useServiceQuery(
    () => profileService.getPublicProfile(slug!),
    [slug],
  );

  if (result.status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-muted/60">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (result.status === "error") {
    return <Navigate to="/" replace />;
  }

  const profile = result.data;
  const profileSlug = profile.username || slug!;

  return (
    <LeaveReviewShell
      backHref={getPublicProfilePath(profileSlug)}
      backUsername={profileSlug}
      title="Share your experience"
      description="Tell us how it went in under a minute. Your feedback helps others understand this professional's current reputation."
      profile={{
        displayName: profile.displayName,
        avatar: profile.avatar,
        professionName: profile.professionName,
        badgeTier: profile.badgeTier,
        badgeSubTier: profile.badgeSubTier,
      }}
      warning={
        !profile.isComplete
          ? {
              title: "Profile still being set up",
              description:
                "This professional hasn't finished their profile yet, but you can still share your experience.",
            }
          : undefined
      }
    >
      <ReviewForm slug={profileSlug} displayName={profile.displayName} />
    </LeaveReviewShell>
  );
}
