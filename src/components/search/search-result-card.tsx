import { Link } from "react-router-dom";
import { AppImage } from "@/components/ui/app-image";
import { MapPin } from "lucide-react";
import { TrustBadge } from "@/components/badges";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Paragraph, Muted } from "@/components/typography/typography";
import { getPublicProfilePath } from "@/lib/profile/public-url";
import type { PublicProfile } from "@/types";
import { cn } from "@/lib/utils";

interface SearchResultCardProps {
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

export function SearchResultCard({ profile, className }: SearchResultCardProps) {
  const location =
    profile.city && profile.state
      ? `${profile.city}, ${profile.state}`
      : profile.city || profile.state;

  return (
    <Card
      className={cn(
        "h-full overflow-hidden shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <Link
        to={getPublicProfilePath(profile.username)}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <CardContent className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-start gap-3">
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
            <div className="min-w-0 flex-1">
              <Paragraph className="truncate font-semibold">
                {profile.displayName}
              </Paragraph>
              <Muted className="truncate text-xs">@{profile.username}</Muted>
            </div>
          </div>

          {profile.professionName ? (
            <Badge variant="secondary" className="w-fit">
              {profile.professionName}
            </Badge>
          ) : null}

          {location ? (
            <Muted className="flex items-center gap-1 text-xs">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{location}</span>
            </Muted>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center gap-2">
            <TrustBadge tier={profile.badgeTier} subTier={profile.badgeSubTier} size="sm" />
            <Muted className="text-xs">
              {profile.totalReviews}{" "}
              {profile.totalReviews === 1 ? "review" : "reviews"}
            </Muted>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
