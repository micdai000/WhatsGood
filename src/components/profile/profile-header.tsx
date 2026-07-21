import { AppImage } from "@/components/ui/app-image";
import { TrustBadge } from "@/components/badges";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { Muted } from "@/components/typography/typography";
import type { PublicProfile } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
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

export function ProfileHeader({ profile, className }: ProfileHeaderProps) {
  const location =
    profile.city && profile.state
      ? `${profile.city}, ${profile.state}`
      : null;

  return (
    <header className={cn("meritt-card overflow-hidden", className)}>
      <div className="h-16 bg-primary sm:h-20" aria-hidden />

      <div className="px-5 pb-6 pt-0 sm:px-8 sm:pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div className="relative -mt-10 size-24 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-md ring-1 ring-border sm:-mt-12 sm:size-28">
              {profile.avatar ? (
                <AppImage
                  src={profile.avatar}
                  alt={`${profile.displayName}'s profile photo`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 96px, 112px"
                  priority
                />
              ) : (
                <div
                  className="flex size-full items-center justify-center bg-primary/10 text-2xl font-semibold text-primary"
                  aria-hidden
                >
                  {getInitials(profile.displayName) || "?"}
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-2 text-center sm:pt-3 sm:text-left">
              <div className="space-y-0.5">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {profile.displayName}
                </h1>
                <Muted className="text-sm">@{profile.username}</Muted>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {profile.professionName ? (
                  <Badge variant="secondary" className="font-medium">
                    {profile.professionName}
                  </Badge>
                ) : null}
                {location ? (
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" aria-hidden />
                    {location}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex justify-center sm:justify-end sm:pt-3">
            <TrustBadge
              tier={profile.badgeTier}
              subTier={profile.badgeSubTier}
              size="lg"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
