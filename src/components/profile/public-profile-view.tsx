import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProfileActions } from "@/components/profile/profile-actions";
import { ProfileBio } from "@/components/profile/profile-bio";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { StatusAlert } from "@/components/ui/status-alert";
import { getPublicProfileUrl } from "@/lib/profile/public-url";
import type { PublicProfile } from "@/types";

interface PublicProfileViewProps {
  profile: PublicProfile;
}

export function PublicProfileView({ profile }: PublicProfileViewProps) {
  const profileUrl = getPublicProfileUrl(profile.username);

  return (
    <Section spacing="default">
      <Container size="narrow" className="space-y-8">
        {!profile.isComplete ? (
          <StatusAlert
            status="warning"
            title="Profile setup in progress"
            description="This professional is still completing their TrustLoop profile. Check back soon for their full public presence."
          />
        ) : null}

        <ProfileHeader profile={profile} />

        <ProfileActions
          profileUrl={profileUrl}
          displayName={profile.displayName}
        />

        <ProfileStats profile={profile} />

        <ProfileBio profile={profile} />

        {profile.isComplete && !profile.bio ? (
          <StatusAlert
            status="default"
            title="No bio yet"
            description={`${profile.displayName} hasn't added a bio to their profile yet.`}
          />
        ) : null}
      </Container>
    </Section>
  );
}
