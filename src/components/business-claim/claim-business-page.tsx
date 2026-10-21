import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FormField as Field,
  SELECT_CLASS_NAME,
} from "@/components/business-onboarding/form-field";
import { LoadingState } from "@/components/layout/loading-state";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusAlert } from "@/components/ui/status-alert";
import { Muted, Paragraph } from "@/components/typography/typography";
import { useAuthContext } from "@/contexts/auth-context";
import { useServiceQuery } from "@/hooks/use-service-query";
import {
  CLAIMANT_ROLE_LABELS,
  VERIFICATION_METHOD_DESCRIPTIONS,
  VERIFICATION_METHOD_LABELS,
} from "@/lib/business/claim";
import { cn } from "@/lib/utils";
import { createClaimRequestSchema } from "@/lib/validators";
import { businessService } from "@/services/businesses";
import { CLAIM_VERIFICATION_METHODS, CLAIMANT_ROLES, isFailure, success } from "@/types";
import type {
  Business,
  BusinessLocation,
  ClaimantRole,
  ClaimVerificationMethod,
} from "@/types";

function websiteDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function methodAvailability(
  business: Business,
  method: ClaimVerificationMethod,
): { available: boolean; detail: string } {
  switch (method) {
    case "phone":
      return business.phone
        ? { available: true, detail: `We'll call ${business.phone}.` }
        : { available: false, detail: "No phone number is listed for this business." };
    case "email": {
      const domain = websiteDomain(business.websiteUrl);
      if (business.email) {
        return { available: true, detail: `We'll email ${business.email}.` };
      }
      if (domain) {
        return {
          available: true,
          detail: `We'll email an address at ${domain} that you give us.`,
        };
      }
      return { available: false, detail: "No email or website is listed for this business." };
    }
    default:
      return { available: true, detail: "" };
  }
}

export function ClaimBusinessPage() {
  const { businessId } = useParams();
  const result = useServiceQuery(async () => {
    const businessResult = await businessService.getBusiness(businessId ?? "");
    if (isFailure(businessResult)) return businessResult;
    const locationsResult = await businessService.getLocations(businessResult.data.id);
    const locations = isFailure(locationsResult) ? [] : locationsResult.data;
    return success({
      business: businessResult.data,
      location: locations.find((item) => item.isPrimary) ?? locations[0] ?? null,
    });
  }, [businessId]);

  if (result.status === "loading") {
    return <LoadingState label="Loading business…" fullPage />;
  }

  return (
    <OnboardingLayout>
      <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {result.status === "error" ? (
          <div className="space-y-4">
            <StatusAlert status="error" title="Business not found" description={result.message} />
            <Link to="/claim" className={cn(buttonVariants({ variant: "outline" }))}>
              Back to search
            </Link>
          </div>
        ) : result.data.business.isClaimed ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight">
              {result.data.business.name} is already claimed
            </h1>
            <Paragraph className="text-muted-foreground">
              If you believe this is a mistake, contact Meritt support and
              we&apos;ll look into it.
            </Paragraph>
            <Link to="/claim" className={cn(buttonVariants({ variant: "outline" }))}>
              Back to search
            </Link>
          </div>
        ) : (
          <ClaimForm business={result.data.business} location={result.data.location} />
        )}
      </div>
    </OnboardingLayout>
  );
}

function ClaimForm({
  business,
  location,
}: {
  business: Business;
  location: BusinessLocation | null;
}) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const defaultMethod =
    CLAIM_VERIFICATION_METHODS.find(
      (method) => methodAvailability(business, method).available,
    ) ?? "document";

  const [claimantName, setClaimantName] = useState("");
  const [claimantRole, setClaimantRole] = useState<ClaimantRole | "">("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [method, setMethod] = useState<ClaimVerificationMethod>(defaultMethod);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [note, setNote] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const locationLabel = location
    ? [location.addressLine1, location.city, location.state].filter(Boolean).join(", ")
    : null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = createClaimRequestSchema.safeParse({
      businessId: business.id,
      claimantName,
      claimantRole: claimantRole || undefined,
      contactPhone: contactPhone.trim() || null,
      contactEmail: contactEmail.trim() || null,
      verificationMethod: method,
      evidenceUrl: evidenceUrl.trim() || null,
      note: note.trim() || null,
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "claimantName");
        next[key] ??= issue.message;
      }
      setFieldErrors(next);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    const result = await businessService.createClaimRequest(parsed.data);
    setSubmitting(false);

    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }

    navigate(`/claim?submitted=${result.data.id}`, { replace: true });
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Claim a business</p>
        <h1 className="text-2xl font-semibold tracking-tight">{business.name}</h1>
        {locationLabel ? <Muted>{locationLabel}</Muted> : null}
      </div>

      <Paragraph className="text-muted-foreground">
        Only the owner or an authorized manager can claim a business. We verify
        every claim using contact details already on the public listing, never
        details you enter here.
      </Paragraph>

      {error ? (
        <StatusAlert status="error" title="Unable to submit claim" description={error} />
      ) : null}

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your full name" htmlFor="claimant-name" error={fieldErrors.claimantName} required>
            <Input
              id="claimant-name"
              value={claimantName}
              onChange={(event) => setClaimantName(event.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label="Your role" htmlFor="claimant-role" error={fieldErrors.claimantRole} required>
            <select
              id="claimant-role"
              value={claimantRole}
              onChange={(event) => setClaimantRole(event.target.value as ClaimantRole)}
              className={SELECT_CLASS_NAME}
            >
              <option value="">Select a role</option>
              {CLAIMANT_ROLES.map((role) => (
                <option key={role} value={role}>
                  {CLAIMANT_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your phone" htmlFor="contact-phone" error={fieldErrors.contactPhone}>
            <Input
              id="contact-phone"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              autoComplete="tel"
            />
          </Field>
          <Field label="Your email" htmlFor="contact-email" error={fieldErrors.contactEmail}>
            <Input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              autoComplete="email"
            />
          </Field>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">How should we verify you?</legend>
        {CLAIM_VERIFICATION_METHODS.map((option) => {
          const availability = methodAvailability(business, option);
          const selected = method === option;
          return (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                selected ? "border-primary bg-primary/5" : "border-border",
                !availability.available && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name="verification-method"
                value={option}
                checked={selected}
                disabled={!availability.available}
                onChange={() => setMethod(option)}
                className="mt-1"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">
                  {VERIFICATION_METHOD_LABELS[option]}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {VERIFICATION_METHOD_DESCRIPTIONS[option]}
                </span>
                {availability.detail ? (
                  <span className="block text-xs text-muted-foreground">
                    {availability.detail}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </fieldset>

      {method === "document" ? (
        <Field
          label="Link to your document"
          htmlFor="evidence-url"
          error={fieldErrors.evidenceUrl}
          hint="A shareable link (Google Drive, Dropbox, etc.) to a license, utility bill, or tax letter showing the business name and address."
          required
        >
          <Input
            id="evidence-url"
            value={evidenceUrl}
            onChange={(event) => setEvidenceUrl(event.target.value)}
            placeholder="https://"
          />
        </Field>
      ) : null}

      <Field label="Anything else we should know?" htmlFor="claim-note" error={fieldErrors.note}>
        <Textarea
          id="claim-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
        />
      </Field>

      <div className="flex gap-3">
        <Link to="/claim" className={cn(buttonVariants({ variant: "outline" }))}>
          Back
        </Link>
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit claim request"}
        </Button>
      </div>
    </form>
  );
}
