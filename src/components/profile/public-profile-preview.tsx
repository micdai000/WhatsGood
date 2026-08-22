import { MapPin } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { TrustBadge } from "@/components/badges/trust-badge";
import { Muted } from "@/components/typography/typography";
import { formatVerifiedExperienceCount } from "@/lib/badges/reputation-copy";
import type { PublicProfile } from "@/types";
import { cn } from "@/lib/utils";

interface PublicProfilePreviewProps {
  profile: PublicProfile;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PublicProfilePreview({
  profile,
  className,
}: PublicProfilePreviewProps) {
  const location =
    profile.city && profile.state
      ? `${profile.city}, ${profile.state}`
      : null;

  return (
    <aside
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5",
        className,
      )}
      aria-label="Profile preview"
    >
      <Muted className="text-xs font-medium uppercase tracking-wide">
        Live preview
      </Muted>

      <div className="mt-4 flex items-start gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {profile.avatar ? (
            <AppImage
              src={profile.avatar}
              alt=""
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center text-sm font-semibold text-primary"
              aria-hidden
            >
              {getInitials(profile.displayName) || "?"}
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-1">
          <p className="truncate font-semibold leading-tight text-foreground">
            {profile.displayName || "Display name"}
          </p>
          <Muted className="truncate text-sm">
            @{profile.username || "username"}
          </Muted>
          {profile.professionName ? (
            <p className="truncate text-sm text-muted-foreground">
              {profile.professionName}
            </p>
          ) : null}
          {location ? (
            <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {location}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <TrustBadge
          tier={profile.badgeTier}
          subTier={profile.badgeSubTier}
          size="sm"
        />
        <Muted className="text-xs">
          {formatVerifiedExperienceCount(profile.totalReviews)}
        </Muted>
      </div>

      {profile.bio?.trim() ? (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {profile.bio}
        </p>
      ) : (
        <Muted className="mt-3 text-xs">
          Add a bio to show it on your public profile.
        </Muted>
      )}
    </aside>
  );
}
