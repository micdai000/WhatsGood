import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BusinessLogoField } from "@/components/business/business-logo-field";
import {
  FormField as Field,
  SELECT_CLASS_NAME,
} from "@/components/business-onboarding/form-field";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusAlert } from "@/components/ui/status-alert";
import { Spinner } from "@/components/ui/spinner";
import { Muted, Paragraph } from "@/components/typography/typography";
import { cn } from "@/lib/utils";
import { storeBusinessId } from "@/lib/business/current-business-storage";
import { US_STATE_CODES } from "@/lib/location/us-states";
import { completeBusinessOnboardingSchema } from "@/lib/validators";
import { businessService } from "@/services/businesses";
import { isFailure } from "@/types";
import type { BusinessCategory, BusinessSearchResult } from "@/types";

type Step = "choice" | "create" | "duplicates" | "location" | "success";

interface BusinessDraft {
  name: string;
  categoryId: string;
  description: string;
  websiteUrl: string;
  phone: string;
  email: string;
  logoUrl: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const EMPTY_DRAFT: BusinessDraft = {
  name: "",
  categoryId: "",
  description: "",
  websiteUrl: "",
  phone: "",
  email: "",
  logoUrl: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

function emptyToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function withHttps(value: string): string | undefined {
  const trimmed = emptyToUndefined(value);
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function BusinessSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("choice");
  const [duplicates, setDuplicates] = useState<BusinessSearchResult[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [draft, setDraft] = useState<BusinessDraft>(EMPTY_DRAFT);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    businessService.getCategories().then((result) => {
      if (cancelled) return;
      setLoadingCategories(false);
      if (!isFailure(result)) {
        setCategories(result.data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryName = useMemo(
    () => categories.find((category) => category.id === draft.categoryId)?.name,
    [categories, draft.categoryId],
  );

  function updateDraft(patch: Partial<BusinessDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setFieldErrors({});
    setError(null);
  }

  function validateCreateStep(): boolean {
    const parsed = completeBusinessOnboardingSchema.pick({
      name: true,
      categoryId: true,
      description: true,
      websiteUrl: true,
      phone: true,
      email: true,
      logoUrl: true,
    }).safeParse({
      name: draft.name,
      categoryId: draft.categoryId,
      description: emptyToUndefined(draft.description),
      websiteUrl: withHttps(draft.websiteUrl),
      phone: emptyToUndefined(draft.phone),
      email: emptyToUndefined(draft.email),
      logoUrl: emptyToUndefined(draft.logoUrl),
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "name");
        next[key] = issue.message;
      }
      setFieldErrors(next);
      return false;
    }

    updateDraft({
      websiteUrl: parsed.data.websiteUrl ?? "",
      logoUrl: parsed.data.logoUrl ?? "",
    });
    return true;
  }

  async function continueFromCreate() {
    if (!validateCreateStep()) return;

    setCheckingDuplicates(true);
    const result = await businessService.searchBusinesses(draft.name.trim());
    setCheckingDuplicates(false);

    const matches = isFailure(result) ? [] : result.data;
    if (matches.length > 0) {
      setDuplicates(matches.slice(0, 5));
      setStep("duplicates");
      return;
    }

    setStep("location");
  }

  async function submitOnboarding() {
    setSubmitting(true);
    setError(null);

    const parsed = completeBusinessOnboardingSchema.safeParse({
      name: draft.name,
      categoryId: draft.categoryId,
      description: emptyToUndefined(draft.description),
      websiteUrl: withHttps(draft.websiteUrl),
      phone: emptyToUndefined(draft.phone),
      email: emptyToUndefined(draft.email),
      logoUrl: emptyToUndefined(draft.logoUrl),
      addressLine1: emptyToUndefined(draft.addressLine1),
      city: draft.city,
      state: draft.state,
      postalCode: emptyToUndefined(draft.postalCode),
      country: draft.country || "US",
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "city");
        next[key] = issue.message;
      }
      setFieldErrors(next);
      setSubmitting(false);
      return;
    }

    const result = await businessService.completeOnboarding(parsed.data);
    setSubmitting(false);

    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }

    storeBusinessId(result.data.business.id);
    setStep("success");
  }

  return (
    <OnboardingLayout>
      <div className="space-y-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {step === "choice" ? (
          <ChoiceStep
            onCreate={() => setStep("create")}
            onClaim={() => navigate("/claim")}
          />
        ) : null}

        {step === "create" ? (
          <CreateStep
            draft={draft}
            categories={categories}
            loadingCategories={loadingCategories}
            fieldErrors={fieldErrors}
            checking={checkingDuplicates}
            onChange={updateDraft}
            onBack={() => setStep("choice")}
            onContinue={() => void continueFromCreate()}
          />
        ) : null}

        {step === "duplicates" ? (
          <DuplicatesStep
            businessName={draft.name}
            matches={duplicates}
            onBack={() => setStep("create")}
            onContinue={() => setStep("location")}
          />
        ) : null}

        {step === "location" ? (
          <LocationStep
            draft={draft}
            categoryName={categoryName}
            fieldErrors={fieldErrors}
            error={error}
            submitting={submitting}
            onChange={updateDraft}
            onBack={() => setStep("create")}
            onSubmit={() => void submitOnboarding()}
          />
        ) : null}

        {step === "success" ? (
          <SuccessStep
            businessName={draft.name}
            onDashboard={() => navigate("/dashboard", { replace: true })}
          />
        ) : null}
      </div>
    </OnboardingLayout>
  );
}

function ChoiceStep({
  onCreate,
  onClaim,
}: {
  onCreate: () => void;
  onClaim: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Get started</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Your business deserves a current reputation.
        </h1>
        <Paragraph className="text-muted-foreground">
          Create a Meritt business profile, or claim one that is already listed.
        </Paragraph>
      </div>

      <div className="grid gap-4">
        <button
          type="button"
          onClick={onCreate}
          className="rounded-xl border border-border bg-background p-5 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
          <p className="font-semibold">Create a Business</p>
          <Muted className="mt-1 text-sm">
            New, independent, or not on Meritt yet? Create your profile and start
            building your current reputation today.
          </Muted>
        </button>
        <button
          type="button"
          onClick={onClaim}
          className="rounded-xl border border-border bg-background p-5 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
          <p className="font-semibold">Claim a Business</p>
          <Muted className="mt-1 text-sm">
            Already listed on Meritt? Verify that you own it to manage its profile
            and see customer feedback.
          </Muted>
        </button>
      </div>
    </div>
  );
}

function DuplicatesStep({
  businessName,
  matches,
  onBack,
  onContinue,
}: {
  businessName: string;
  matches: BusinessSearchResult[];
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Is one of these your business?
        </h1>
        <Paragraph className="text-muted-foreground">
          We found listings similar to &ldquo;{businessName}&rdquo;. If yours is
          already here, claim it instead of creating a duplicate. Any customer
          feedback it has collected comes with it.
        </Paragraph>
      </div>

      <ul className="divide-y divide-border rounded-xl border border-border">
        {matches.map((match) => (
          <li
            key={match.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{match.name}</p>
              <Muted className="text-sm">
                {[match.categoryName, [match.city, match.state].filter(Boolean).join(", ")]
                  .filter(Boolean)
                  .join(" · ")}
              </Muted>
            </div>
            {match.isClaimed ? (
              <Muted className="text-sm">Already claimed</Muted>
            ) : (
              <Link
                to={`/claim/${match.id}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                This is mine — claim it
              </Link>
            )}
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" className="flex-1" onClick={onContinue}>
          None of these — continue
        </Button>
      </div>
    </div>
  );
}

function CreateStep({
  draft,
  categories,
  loadingCategories,
  fieldErrors,
  checking,
  onChange,
  onBack,
  onContinue,
}: {
  draft: BusinessDraft;
  categories: BusinessCategory[];
  loadingCategories: boolean;
  fieldErrors: Record<string, string>;
  checking: boolean;
  onChange: (patch: Partial<BusinessDraft>) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [uploadingLogo, setUploadingLogo] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your business
        </h1>
        <Paragraph className="text-muted-foreground">
          Only the essentials. You can add more details later.
        </Paragraph>
      </div>

      <div className="space-y-4">
        <Field label="Business name" htmlFor="business-name" error={fieldErrors.name} required>
          <Input
            id="business-name"
            value={draft.name}
            onChange={(event) => onChange({ name: event.target.value })}
            autoComplete="organization"
          />
        </Field>

        <Field
          label="Category"
          htmlFor="business-category"
          error={fieldErrors.categoryId}
          required
        >
          {loadingCategories ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <select
              id="business-category"
              value={draft.categoryId}
              onChange={(event) => onChange({ categoryId: event.target.value })}
              className={SELECT_CLASS_NAME}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Description" htmlFor="business-description" error={fieldErrors.description}>
          <Textarea
            id="business-description"
            value={draft.description}
            onChange={(event) => onChange({ description: event.target.value })}
            rows={4}
          />
        </Field>

        <Field label="Website" htmlFor="business-website" error={fieldErrors.websiteUrl}>
          <Input
            id="business-website"
            value={draft.websiteUrl}
            onChange={(event) => onChange({ websiteUrl: event.target.value })}
            placeholder="https://"
            autoComplete="url"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" htmlFor="business-phone" error={fieldErrors.phone}>
            <Input
              id="business-phone"
              value={draft.phone}
              onChange={(event) => onChange({ phone: event.target.value })}
              autoComplete="tel"
            />
          </Field>
          <Field label="Email" htmlFor="business-email" error={fieldErrors.email}>
            <Input
              id="business-email"
              type="email"
              value={draft.email}
              onChange={(event) => onChange({ email: event.target.value })}
              autoComplete="email"
            />
          </Field>
        </div>

        <BusinessLogoField
          value={draft.logoUrl}
          onChange={(logoUrl) => onChange({ logoUrl })}
          onUploadingChange={setUploadingLogo}
        />
        {fieldErrors.logoUrl ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.logoUrl}
          </p>
        ) : null}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={checking}>
          Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={onContinue}
          disabled={uploadingLogo || checking}
        >
          {uploadingLogo ? "Uploading logo…" : checking ? "Checking…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}

function LocationStep({
  draft,
  categoryName,
  fieldErrors,
  error,
  submitting,
  onChange,
  onBack,
  onSubmit,
}: {
  draft: BusinessDraft;
  categoryName?: string;
  fieldErrors: Record<string, string>;
  error: string | null;
  submitting: boolean;
  onChange: (patch: Partial<BusinessDraft>) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Where is your business located?
        </h1>
        <Paragraph className="text-muted-foreground">
          {draft.name}
          {categoryName ? ` · ${categoryName}` : ""}
        </Paragraph>
      </div>

      {error ? <StatusAlert status="error" title="Unable to create business" description={error} /> : null}

      <div className="space-y-4">
        <Field label="Address" htmlFor="address" error={fieldErrors.addressLine1}>
          <Input
            id="address"
            value={draft.addressLine1}
            onChange={(event) => onChange({ addressLine1: event.target.value })}
            autoComplete="street-address"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" htmlFor="city" error={fieldErrors.city} required>
            <Input
              id="city"
              value={draft.city}
              onChange={(event) => onChange({ city: event.target.value })}
              autoComplete="address-level2"
            />
          </Field>
          <Field label="State" htmlFor="state" error={fieldErrors.state} required>
            <select
              id="state"
              value={draft.state}
              onChange={(event) => onChange({ state: event.target.value })}
              autoComplete="address-level1"
              className={SELECT_CLASS_NAME}
            >
              <option value="">State</option>
              {US_STATE_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Postal code" htmlFor="postal" error={fieldErrors.postalCode}>
            <Input
              id="postal"
              value={draft.postalCode}
              onChange={(event) => onChange({ postalCode: event.target.value })}
              autoComplete="postal-code"
            />
          </Field>
          <Field label="Country" htmlFor="country" error={fieldErrors.country}>
            <Input
              id="country"
              value={draft.country}
              onChange={(event) => onChange({ country: event.target.value.toUpperCase() })}
              autoComplete="country"
              maxLength={2}
            />
          </Field>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button type="button" className="flex-1" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Creating…" : "Create business"}
        </Button>
      </div>
    </div>
  );
}

function SuccessStep({
  businessName,
  onDashboard,
}: {
  businessName: string;
  onDashboard: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Your business is ready.
        </h1>
        <Paragraph className="text-muted-foreground">
          {businessName} now has a live Meritt profile. Our team reviews new
          listings and adds a Verified badge once confirmed.
        </Paragraph>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-5">
        <p className="text-sm font-medium">Your next step</p>
        <p className="mt-1 text-sm font-semibold">
          Get your QR code in front of customers.
        </p>
        <Muted className="mt-2 text-sm">
          Your QR code gives customers a direct way to interact with your Meritt
          profile and helps you build your current reputation.
        </Muted>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/dashboard/qr"
          className={cn(buttonVariants(), "flex-1")}
        >
          View My QR Code
        </Link>
        <Button type="button" variant="outline" className="flex-1" onClick={onDashboard}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
