import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone } from "lucide-react";
import { Muted } from "@/components/typography/typography";
import { ProfileSocialLinks } from "@/components/profile/profile-social-links";
import { getInitials } from "@/lib/auth/display-name";
import { toTelHref } from "@/lib/business/phone";
import {
  getDisplayableSocialLinks,
  socialLinksForBusiness,
} from "@/lib/profile/social-links";
import type { Business } from "@/types";
import { cn } from "@/lib/utils";

interface PublicBusinessHeaderProps {
  business: Business;
  categoryName?: string | null;
  city?: string | null;
  state?: string | null;
  className?: string;
}

export function PublicBusinessHeader({
  business,
  categoryName,
  city,
  state,
  className,
}: PublicBusinessHeaderProps) {
  const location =
    city && state ? `${city}, ${state}` : city || state || null;
  const socialLinks = socialLinksForBusiness({
    socialLinks: business.socialLinks,
    websiteUrl: business.websiteUrl,
  });
  const hasProfessionalLinks = getDisplayableSocialLinks(socialLinks).length > 0;
  const phoneHref = toTelHref(business.phone);

  return (
    <header className={cn("meritt-card overflow-hidden", className)}>
      <div className="h-16 bg-primary sm:h-20" aria-hidden />

      <div className="px-5 pb-6 pt-0 sm:px-8 sm:pb-8">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-8">
          <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div className="relative -mt-10 size-24 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-md ring-1 ring-border sm:-mt-12 sm:size-28">
              {business.logoUrl ? (
                <AppImage
                  src={business.logoUrl}
                  alt={`${business.name}'s profile photo`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 96px, 112px"
                />
              ) : (
                <div
                  className="flex size-full items-center justify-center bg-primary/10 text-2xl font-semibold text-primary"
                  aria-hidden
                >
                  {getInitials(business.name) || "?"}
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-2 text-center sm:pt-3 sm:text-left">
              <div className="space-y-0.5">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {business.name}
                </h1>
                <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                  <Muted as="span" className="text-sm leading-none">
                    @{business.slug}
                  </Muted>
                  {phoneHref ? (
                    <CallPhoneLink href={phoneHref} name={business.name} />
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {categoryName ? (
                  <Badge variant="secondary" className="font-medium">
                    {categoryName}
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

          {hasProfessionalLinks ? (
            <div className="flex w-full justify-center sm:mt-3 sm:min-w-0 sm:flex-1 sm:self-center">
              <ProfileSocialLinks links={socialLinks} />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function CallPhoneLink({ href, name }: { href: string; name: string }) {
  const label = `Call ${name}`;

  return (
    <a
      href={href}
      aria-label={label}
      className={cn(
        "group relative inline-flex size-7 shrink-0 items-center justify-center rounded-md",
        "text-muted-foreground",
        "transition-[color,opacity,transform] duration-200 ease-out",
        "opacity-80 hover:scale-105 hover:text-primary hover:opacity-100",
        "focus-visible:scale-105 focus-visible:text-primary focus-visible:opacity-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <Phone className="size-3.5" strokeWidth={1.75} aria-hidden />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2",
          "whitespace-nowrap rounded-md bg-foreground px-2 py-1",
          "text-[11px] font-medium leading-none text-background shadow-sm",
          "opacity-0 transition-opacity duration-150",
          "group-hover:opacity-100 group-focus-visible:opacity-100",
        )}
      >
        {label}
      </span>
    </a>
  );
}
