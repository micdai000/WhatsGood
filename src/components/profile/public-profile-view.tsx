import { Container } from "@/components/layout/container";

import { Section } from "@/components/layout/section";

import { ProfileActions } from "@/components/profile/profile-actions";

import { ProfileBio } from "@/components/profile/profile-bio";

import { ProfileHeader } from "@/components/profile/profile-header";

import { ProfileRecentVotes } from "@/components/profile/profile-recent-votes";

import { ProfileReputationHero } from "@/components/profile/profile-reputation-hero";

import { ProfileReputationWhy } from "@/components/profile/profile-reputation-why";

import { ProfileReviewsSection } from "@/components/profile/profile-reviews-section";

import { StatusAlert } from "@/components/ui/status-alert";

import { brandCopy } from "@/lib/brand";
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

      <Container size="wide" className="max-w-3xl space-y-8 sm:space-y-10">

        {!profile.isComplete ? (

          <StatusAlert

            status="warning"

            title="Profile setup in progress"

            description={brandCopy.profileSetupIncompleteWithBrand(profile.displayName)}

          />

        ) : null}



        <ProfileHeader profile={profile} />



        <ProfileReputationHero

          badgeTier={profile.badgeTier}

          badgeSubTier={profile.badgeSubTier}

          badgePeriod={profile.badgePeriod}

          reviewCount={profile.totalReviews}

        />



        <ProfileReputationWhy

          badgePeriod={profile.badgePeriod}

          professionName={profile.professionName}

          reviewCount={profile.totalReviews}

        />



        <ProfileBio profile={profile} />



        {profile.isComplete && !profile.bio?.trim() ? (

          <StatusAlert

            status="default"

            title="No bio yet"

            description={`${profile.displayName} hasn't added a bio to their profile yet.`}

          />

        ) : null}



        <ProfileReviewsSection slug={profile.username} />



        <ProfileRecentVotes

          slug={profile.username}

          displayName={profile.displayName}

          totalReviews={profile.totalReviews}

          className="rounded-2xl border border-border bg-muted/20 p-5 sm:p-6"

        />



        <ProfileActions

          profileUrl={profileUrl}

          displayName={profile.displayName}

          leaveReviewHref={leaveReviewHref}

          className="border-t border-border pt-6"

        />

      </Container>

    </Section>

  );

}


