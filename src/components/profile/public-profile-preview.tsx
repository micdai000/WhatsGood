import { ProfileBio } from "@/components/profile/profile-bio";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileReputationHero } from "@/components/profile/profile-reputation-hero";
import { ProfileReputationWhy } from "@/components/profile/profile-reputation-why";
import { Muted } from "@/components/typography/typography";
import type { PublicProfile } from "@/types";
import { cn } from "@/lib/utils";

interface PublicProfilePreviewProps {
  profile: PublicProfile;
  className?: string;
}

export function PublicProfilePreview({
  profile,
  className,
}: PublicProfilePreviewProps) {
  return (
    <aside
      className={cn(
        "space-y-6 rounded-xl border border-border bg-muted/20 p-4 sm:p-6",
        className,
      )}
      aria-label="Profile preview"
    >
      <Muted className="text-xs font-medium uppercase tracking-wide">
        Live preview
      </Muted>
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
      {!profile.bio?.trim() ? (
        <Muted className="text-center text-xs">
          Add a bio to show the About section on your public profile.
        </Muted>
      ) : null}
    </aside>
  );
}
