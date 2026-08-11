import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { TrustBadge } from "@/components/badges/trust-badge";
import { AppImage } from "@/components/ui/app-image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Paragraph, Muted, SectionEyebrow } from "@/components/typography/typography";
import { formatBadgeHeroTitle } from "@/lib/badges/display";
import {
  CURRENT_REPUTATION_LABEL,
  formatReputationUpdatedLabel,
  formatVerifiedExperienceCount,
} from "@/lib/badges/reputation-copy";
import { VIEW_REPUTATION_LABEL } from "@/lib/search/discovery-copy";
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

  const tierTitle = formatBadgeHeroTitle(profile.badgeTier, profile.badgeSubTier);

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
        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-3">
            <div className="min-w-0 space-y-1">
              <SectionEyebrow className="text-[10px]">
                {CURRENT_REPUTATION_LABEL}
              </SectionEyebrow>
              <p className="text-base font-semibold leading-tight text-foreground">
                {tierTitle}
              </p>
            </div>
            <TrustBadge
              tier={profile.badgeTier}
              subTier={profile.badgeSubTier}
              size="sm"
              showLabel={false}
              className="shrink-0"
            />
          </div>

          <div className="flex items-start gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              {profile.avatar ? (
                <AppImage
                  src={profile.avatar}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div
                  className="flex size-full items-center justify-center bg-primary/10 text-xs font-semibold text-primary"
                  aria-hidden
                >
                  {getInitials(profile.displayName)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <Paragraph className="truncate font-semibold leading-snug">
                {profile.displayName}
              </Paragraph>
              {profile.professionName ? (
                <Badge variant="secondary" className="max-w-full truncate text-xs">
                  {profile.professionName}
                </Badge>
              ) : null}
              {location ? (
                <Muted className="flex items-center gap-1 text-xs">
                  <MapPin className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">{location}</span>
                </Muted>
              ) : null}
            </div>
          </div>

          <div className="mt-auto space-y-1">
            <Muted className="block text-xs">
              {formatReputationUpdatedLabel(profile.badgePeriod)}
            </Muted>
            <Muted className="block text-xs">
              {formatVerifiedExperienceCount(profile.totalReviews)}
            </Muted>
          </div>

          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            {VIEW_REPUTATION_LABEL}
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}
