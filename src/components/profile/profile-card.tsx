import { Link } from "react-router-dom";
import { AppImage } from "@/components/ui/app-image";
import { TrustBadge } from "@/components/badges";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Paragraph, Muted } from "@/components/typography/typography";
import { getPublicProfilePath } from "@/lib/profile/public-url";
import type { PublicProfile } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
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

export function ProfileCard({ profile, className }: ProfileCardProps) {
  return (
    <Card className={cn("shadow-sm transition-shadow hover:shadow-md", className)}>
      <Link
        to={getPublicProfilePath(profile.username)}
        className="flex items-center gap-4 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
          {profile.avatar ? (
            <AppImage
              src={profile.avatar}
              alt=""
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center bg-primary/10 text-sm font-semibold text-primary"
              aria-hidden
            >
              {getInitials(profile.displayName)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <Paragraph className="truncate font-medium">{profile.displayName}</Paragraph>
          <Muted className="truncate text-xs">@{profile.username}</Muted>
          <div className="flex flex-wrap items-center gap-2">
            {profile.professionName ? (
              <Badge variant="secondary" className="text-[10px]">
                {profile.professionName}
              </Badge>
            ) : null}
            <TrustBadge tier={profile.badgeTier} subTier={profile.badgeSubTier} size="sm" />
            <Muted className="text-xs tabular-nums">
              {profile.totalReviews} reviews
            </Muted>
          </div>
        </div>
      </Link>
    </Card>
  );
}
