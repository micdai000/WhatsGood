import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { H1, Muted } from "@/components/typography/typography";
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
    <header
      className={cn(
        "flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left",
        className,
      )}
    >
      <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted shadow-sm sm:size-32">
        {profile.avatar ? (
          <Image
            src={profile.avatar}
            alt={`${profile.displayName}'s profile photo`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 112px, 128px"
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

      <div className="min-w-0 flex-1 space-y-3">
        <div className="space-y-1">
          <H1 className="text-2xl sm:text-3xl">{profile.displayName}</H1>
          <Muted>@{profile.username}</Muted>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {profile.professionName ? (
            <Badge variant="secondary">{profile.professionName}</Badge>
          ) : null}
          {location ? (
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {location}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
