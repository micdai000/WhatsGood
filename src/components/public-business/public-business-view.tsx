import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Muted, Paragraph } from "@/components/typography/typography";
import { GiveFeedbackFlow } from "@/components/public-business/give-feedback-flow";
import { ProfileSocialLinks } from "@/components/profile/profile-social-links";
import type { Business, BusinessCategory, BusinessLocation, PublicBusinessQrCode } from "@/types";

export function PublicBusinessView({
  business,
  category,
  location,
  qr,
}: {
  business: Business;
  category?: BusinessCategory | null;
  location?: BusinessLocation | null;
  qr?: PublicBusinessQrCode | null;
}) {
  const building =
    business.totalFeedback === 0 || business.currentReputationTier === "building";
  const locationLabel = location
    ? [location.city, location.state].filter(Boolean).join(", ")
    : null;

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        {business.logoUrl ? (
          <AppImage
            src={business.logoUrl}
            alt={business.name}
            className="size-16 rounded-xl border border-border object-cover"
          />
        ) : null}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{business.name}</h1>
            {business.isClaimed && business.isVerified ? (
              <Badge variant="secondary" className="gap-1">
                <BadgeCheck className="size-3.5" aria-hidden />
                Verified owner
              </Badge>
            ) : null}
          </div>
          <Muted>
            {[category?.name, locationLabel].filter(Boolean).join(" · ")}
          </Muted>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Current reputation
          </p>
          {building ? (
            <div className="mt-2 space-y-1">
              <p className="text-lg font-semibold">Building reputation</p>
              <Muted className="text-sm">
                This business is just getting started on Meritt.
              </Muted>
            </div>
          ) : (
            <div className="mt-2 space-y-1">
              <p className="text-lg font-semibold capitalize">
                {business.currentReputationTier}
              </p>
              <Muted className="text-sm">
                Based on recent customer feedback
                {business.currentReputationPeriod
                  ? ` · Updated ${business.currentReputationPeriod}`
                  : ""}
              </Muted>
            </div>
          )}
        </div>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">
          See how this business is doing today.
        </h2>
        <Paragraph className="text-muted-foreground">
          Meritt focuses on current reputation rather than letting years-old
          reviews define a business.
        </Paragraph>
      </section>

      {business.description ? (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">About</h2>
          <Paragraph className="text-muted-foreground">{business.description}</Paragraph>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">How Meritt works</h2>
        <Paragraph className="text-muted-foreground">
          A visit is a few taps: whether you would recommend them, whether they
          did what they said, whether it was worth it, and how you were treated.
          There is no comment box. Each visit is saved toward this business&apos;s
          current reputation.
        </Paragraph>
        <Muted className="text-sm">
          {business.totalFeedback} customer feedback
          {business.totalFeedback === 1 ? " submission" : " submissions"}
        </Muted>
      </section>

      <ProfileSocialLinks links={business.socialLinks} align="start" />

      {business.phone ? (
        <section className="space-y-1 text-sm">
          <p>{business.phone}</p>
        </section>
      ) : null}

      <GiveFeedbackFlow
        businessId={business.id}
        businessName={business.name}
        qr={qr}
      />

      {!business.isClaimed ? (
        <section className="space-y-2 rounded-xl border border-dashed border-border p-5">
          <p className="font-semibold">Is this your business?</p>
          <Muted className="text-sm">
            {business.totalFeedback > 0
              ? `Customers have already shared ${business.totalFeedback} piece${business.totalFeedback === 1 ? "" : "s"} of feedback. Claim this listing to see it, update your profile, and get your QR code.`
              : "Claim this listing to manage your profile, see customer feedback, and get your QR code."}
          </Muted>
          <Link
            to={`/claim/${business.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Claim this business
          </Link>
        </section>
      ) : null}
    </div>
  );
}
