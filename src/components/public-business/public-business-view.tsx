import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Muted, Paragraph } from "@/components/typography/typography";
import { GiveFeedbackFlow } from "@/components/public-business/give-feedback-flow";
import { PublicBusinessHeader } from "@/components/public-business/public-business-header";
import { displayCategoryName } from "@/lib/business/categories";
import { cn } from "@/lib/utils";
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

  return (
    <div className="space-y-8 sm:space-y-10">
      <PublicBusinessHeader
        business={business}
        categoryName={displayCategoryName(category, business.customCategory)}
        city={location?.city}
        state={location?.state}
      />

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
          There is no comment box. Those recent visits move a business through
          Bronze, Silver, Gold, and Elite.
        </Paragraph>
        <Muted className="text-sm">
          {business.totalFeedback} customer feedback
          {business.totalFeedback === 1 ? " submission" : " submissions"}
        </Muted>
      </section>

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
