import { ProfileBio } from "@/components/profile/profile-bio";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStats } from "@/components/profile/profile-stats";
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
      <ProfileStats profile={profile} />
      <ProfileBio profile={profile} />
      {!profile.bio?.trim() ? (
        <Muted className="text-center text-xs">
          Add a bio to show the About section on your public profile.
        </Muted>
      ) : null}
    </aside>
  );
}
