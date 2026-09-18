import { AppImage } from "@/components/ui/app-image";
import { Muted, Paragraph } from "@/components/typography/typography";
import { GiveFeedbackFlow } from "@/components/public-business/give-feedback-flow";
import { getInitials } from "@/lib/auth/display-name";
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
        <div className="relative size-20 overflow-hidden rounded-full border border-border bg-muted">
          {business.logoUrl ? (
            <AppImage
              src={business.logoUrl}
              alt={business.name}
              fill
              className="object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
              {getInitials(business.name) || "?"}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{business.name}</h1>
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
          Meritt uses recent customer feedback to help show a business&apos;s
          current reputation. Older experiences should not define a business
          forever.
        </Paragraph>
        <Muted className="text-sm">
          {business.totalFeedback} customer feedback
          {business.totalFeedback === 1 ? " submission" : " submissions"}
        </Muted>
      </section>

      {(business.websiteUrl || business.phone) ? (
        <section className="space-y-1 text-sm">
          {business.websiteUrl ? (
            <a href={business.websiteUrl} className="text-primary underline-offset-4 hover:underline">
              {business.websiteUrl}
            </a>
          ) : null}
          {business.phone ? <p>{business.phone}</p> : null}
        </section>
      ) : null}

      <GiveFeedbackFlow
        businessId={business.id}
        businessName={business.name}
        qr={qr}
      />
    </div>
  );
}
