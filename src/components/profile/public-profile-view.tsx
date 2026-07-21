import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProfileActions } from "@/components/profile/profile-actions";
import { ProfileBio } from "@/components/profile/profile-bio";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileRecentVotes } from "@/components/profile/profile-recent-votes";
import { ProfileReviewsSection } from "@/components/profile/profile-reviews-section";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfileTrustCard } from "@/components/profile/profile-trust-card";
import { StatusAlert } from "@/components/ui/status-alert";
import { getPublicProfileUrl } from "@/lib/profile/public-url";
import type { PublicProfile } from "@/types";

interface PublicProfileViewProps {
  profile: PublicProfile;
}

export function PublicProfileView({ profile }: PublicProfileViewProps) {
  const profileUrl = getPublicProfileUrl(profile.username);
  const leaveReviewHref = `/review/${profile.username}`;

  return (
    <Section spacing="tight" className="pb-16 sm:pb-20">
      <Container size="wide" className="max-w-5xl space-y-6">
        {!profile.isComplete ? (
          <StatusAlert
            status="warning"
            title="Profile setup in progress"
            description="This professional is still completing their Meritt profile. Check back soon for their full public presence."
          />
        ) : null}

        <ProfileHeader profile={profile} />

        <div className="grid items-start gap-8 sm:grid-cols-[minmax(0,1fr)_17.5rem] sm:gap-8">
          <div className="min-w-0 space-y-6">
            <ProfileStats profile={profile} />
            <ProfileActions
              profileUrl={profileUrl}
              displayName={profile.displayName}
              leaveReviewHref={leaveReviewHref}
            />
            <ProfileTrustCard
              badgeTier={profile.badgeTier}
              badgeSubTier={profile.badgeSubTier}
              badgePeriod={profile.badgePeriod}
              professionName={profile.professionName}
              reviewCount={profile.totalReviews}
            />
            <ProfileBio profile={profile} />

            {profile.isComplete && !profile.bio ? (
              <StatusAlert
                status="default"
                title="No bio yet"
                description={`${profile.displayName} hasn't added a bio to their profile yet.`}
              />
            ) : null}

            <ProfileReviewsSection slug={profile.username} />
          </div>

          <ProfileRecentVotes
            slug={profile.username}
            displayName={profile.displayName}
            totalReviews={profile.totalReviews}
            className="sm:sticky sm:top-24"
          />
        </div>
      </Container>
    </Section>
  );
}
