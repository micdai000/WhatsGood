import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { TrustBadge } from "@/components/badges/trust-badge";
import { AppImage } from "@/components/ui/app-image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Paragraph, Muted, SectionEyebrow } from "@/components/typography/typography";
import { CURRENT_REPUTATION_LABEL } from "@/lib/badges/reputation-copy";
import { getPublicBusinessPath } from "@/lib/business/public-url";
import { VIEW_REPUTATION_LABEL } from "@/lib/search/discovery-copy";
import type { BadgeTier, DiscoverableBusiness, ReputationTier } from "@/types";
import { cn } from "@/lib/utils";

interface SearchResultCardProps {
  business: DiscoverableBusiness;
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

function sealTier(tier: ReputationTier): BadgeTier {
  return tier === "building" ? "none" : tier;
}

function tierTitle(tier: ReputationTier): string {
  if (tier === "building") return "Building reputation";
  const label = tier.charAt(0).toUpperCase() + tier.slice(1);
  return label;
}

function feedbackLabel(count: number): string {
  return count === 1
    ? "1 customer feedback submission"
    : `${count} customer feedback submissions`;
}

export function SearchResultCard({ business, className }: SearchResultCardProps) {
  const location =
    business.city && business.state
      ? `${business.city}, ${business.state}`
      : business.city || business.state;

  return (
    <Card
      className={cn(
        "h-full overflow-hidden shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <Link
        to={getPublicBusinessPath(business.slug)}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-3">
            <div className="min-w-0 space-y-1">
              <SectionEyebrow className="text-[10px]">
                {CURRENT_REPUTATION_LABEL}
              </SectionEyebrow>
              <p className="text-base font-semibold leading-tight text-foreground">
                {tierTitle(business.reputationTier)}
              </p>
            </div>
            <TrustBadge
              tier={sealTier(business.reputationTier)}
              size="sm"
              showLabel={false}
              className="shrink-0"
            />
          </div>

          <div className="flex items-start gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              {business.logoUrl ? (
                <AppImage
                  src={business.logoUrl}
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
                  {getInitials(business.name)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <Paragraph className="truncate font-semibold leading-snug">
                {business.name}
              </Paragraph>
              {business.categoryName ? (
                <Badge variant="secondary" className="max-w-full truncate text-xs">
                  {business.categoryName}
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

          <Muted className="mt-auto block text-xs">
            {feedbackLabel(business.totalFeedback)}
          </Muted>

          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            {VIEW_REPUTATION_LABEL}
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}
