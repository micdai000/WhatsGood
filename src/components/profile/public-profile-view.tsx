import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProfileActions } from "@/components/profile/profile-actions";
import { ProfileBio } from "@/components/profile/profile-bio";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileReviewsSection } from "@/components/profile/profile-reviews-section";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfileVotesSidebar } from "@/components/profile/profile-votes-sidebar";
import { StatusAlert } from "@/components/ui/status-alert";
import { getPublicProfileUrl } from "@/lib/profile/public-url";
import type { PublicProfile } from "@/types";
import { cn } from "@/lib/utils";

interface PublicProfileViewProps {
  profile: PublicProfile;
}

export function PublicProfileView({ profile }: PublicProfileViewProps) {
  const profileUrl = getPublicProfileUrl(profile.username);
  const hasVotes = profile.totalReviews > 0;

  return (
    <Section spacing="default">
      <Container
        size="narrow"
        className={cn(
          "max-w-4xl",
          hasVotes &&
            "sm:grid sm:grid-cols-[minmax(0,1fr)_11.5rem] sm:items-start sm:gap-8 sm:space-y-0",
        )}
      >
        <div className="min-w-0 space-y-8 sm:col-start-1">
          {!profile.isComplete ? (
            <StatusAlert
              status="warning"
              title="Profile setup in progress"
              description="This professional is still completing their Meritt profile. Check back soon for their full public presence."
            />
          ) : null}

          <ProfileHeader profile={profile} />

          <ProfileActions
            profileUrl={profileUrl}
            displayName={profile.displayName}
            leaveReviewHref={`/review/${profile.username}`}
          />

          <ProfileStats profile={profile} />

          <ProfileBio profile={profile} />

          <ProfileReviewsSection
            slug={profile.username}
            displayName={profile.displayName}
            professionName={profile.professionName}
            badgeTier={profile.badgeTier}
            badgeSubTier={profile.badgeSubTier}
            badgePeriod={profile.badgePeriod}
            totalReviews={profile.totalReviews}
          />

          {profile.isComplete && !profile.bio ? (
            <StatusAlert
              status="default"
              title="No bio yet"
              description={`${profile.displayName} hasn't added a bio to their profile yet.`}
            />
          ) : null}
        </div>

        {hasVotes ? (
          <ProfileVotesSidebar
            slug={profile.username}
            totalReviews={profile.totalReviews}
            className="sm:sticky sm:top-24 sm:col-start-2 sm:row-start-1 sm:self-start"
          />
        ) : null}
      </Container>
    </Section>
  );
}
