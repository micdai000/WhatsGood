import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusAlert } from "@/components/ui/status-alert";
import { Spinner } from "@/components/ui/spinner";
import { Muted, Paragraph } from "@/components/typography/typography";
import { cn } from "@/lib/utils";
import { storeBusinessId } from "@/lib/business/current-business-storage";
import {
  displayCategoryName,
  isOtherCategory,
} from "@/lib/business/categories";
import { LIMITS } from "@/lib/constants";
import { completeBusinessOnboardingSchema } from "@/lib/validators";
import { BusinessCategoryFields } from "@/components/business/category-fields";
import { businessService } from "@/services/businesses";
import { isFailure } from "@/types";
import type { BusinessCategory, BusinessSearchResult } from "@/types";

type Step = "choice" | "create" | "location" | "claim" | "success";

interface BusinessDraft {
  name: string;
  categoryId: string;
  customCategory: string;
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
  customCategory: "",
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
  const [draft, setDraft] = useState<BusinessDraft>(EMPTY_DRAFT);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<BusinessSearchResult[]>([]);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

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
    () =>
      displayCategoryName(
        categories.find((category) => category.id === draft.categoryId),
        draft.customCategory,
      ),
    [categories, draft.categoryId, draft.customCategory],
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
      customCategory: true,
      description: true,
      websiteUrl: true,
      phone: true,
      email: true,
      logoUrl: true,
    }).safeParse({
      name: draft.name,
      categoryId: draft.categoryId,
      customCategory: emptyToUndefined(draft.customCategory) ?? null,
      description: emptyToUndefined(draft.description),
      websiteUrl: withHttps(draft.websiteUrl),
      phone: emptyToUndefined(draft.phone),
      email: emptyToUndefined(draft.email),
      logoUrl: withHttps(draft.logoUrl),
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

    const selected = categories.find(
      (category) => category.id === draft.categoryId,
    );
    if (
      selected &&
      isOtherCategory(selected) &&
      draft.customCategory.trim().length < LIMITS.CUSTOM_CATEGORY_MIN_LENGTH
    ) {
      setFieldErrors({
        customCategory: "Please describe your category",
      });
      return false;
    }

    updateDraft({
      websiteUrl: parsed.data.websiteUrl ?? "",
      logoUrl: parsed.data.logoUrl ?? "",
    });
    return true;
  }

  async function submitOnboarding() {
    setSubmitting(true);
    setError(null);

    const parsed = completeBusinessOnboardingSchema.safeParse({
      name: draft.name,
      categoryId: draft.categoryId,
      customCategory: emptyToUndefined(draft.customCategory) ?? null,
      description: emptyToUndefined(draft.description),
      websiteUrl: withHttps(draft.websiteUrl),
      phone: emptyToUndefined(draft.phone),
      email: emptyToUndefined(draft.email),
      logoUrl: withHttps(draft.logoUrl),
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

  async function runSearch(value: string) {
    setSearch(value);
    setClaimMessage(null);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    const result = await businessService.searchBusinesses(value);
    setSearching(false);
    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }
    setResults(result.data);
  }

  async function requestClaim(businessId: string, isClaimed: boolean) {
    setClaimMessage(null);
    setError(null);
    if (isClaimed) {
      setClaimMessage("This business is already claimed.");
      return;
    }

    setSubmitting(true);
    const result = await businessService.createClaimRequest({ businessId });
    setSubmitting(false);

    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }

    setClaimMessage("Your claim request is pending review.");
  }

  return (
    <OnboardingLayout>
      <div className="space-y-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {step === "choice" ? (
          <ChoiceStep
            onCreate={() => setStep("create")}
            onClaim={() => setStep("claim")}
          />
        ) : null}

        {step === "create" ? (
          <CreateStep
            draft={draft}
            categories={categories}
            loadingCategories={loadingCategories}
            fieldErrors={fieldErrors}
            onChange={updateDraft}
            onBack={() => setStep("choice")}
            onContinue={() => {
              if (validateCreateStep()) setStep("location");
            }}
          />
        ) : null}

        {step === "location" ? (
          <LocationStep
            draft={draft}
            categoryName={categoryName ?? undefined}
            fieldErrors={fieldErrors}
            error={error}
            submitting={submitting}
            onChange={updateDraft}
            onBack={() => setStep("create")}
            onSubmit={() => void submitOnboarding()}
          />
        ) : null}

        {step === "claim" ? (
          <ClaimStep
            search={search}
            searching={searching}
            results={results}
            error={error}
            claimMessage={claimMessage}
            submitting={submitting}
            onSearch={runSearch}
            onClaim={(id, claimed) => void requestClaim(id, claimed)}
            onBack={() => setStep("choice")}
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
            Create a new business profile and start building your current
            reputation.
          </Muted>
        </button>
        <button
          type="button"
          onClick={onClaim}
          className="rounded-xl border border-border bg-background p-5 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
          <p className="font-semibold">Claim a Business</p>
          <Muted className="mt-1 text-sm">
            Already listed on Meritt? Claim your business to manage its profile
            and reputation.
          </Muted>
        </button>
      </div>
    </div>
  );
}

function CreateStep({
  draft,
  categories,
  loadingCategories,
  fieldErrors,
  onChange,
  onBack,
  onContinue,
}: {
  draft: BusinessDraft;
  categories: BusinessCategory[];
  loadingCategories: boolean;
  fieldErrors: Record<string, string>;
  onChange: (patch: Partial<BusinessDraft>) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
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

        {loadingCategories ? (
          <Spinner className="h-5 w-5" />
        ) : (
          <BusinessCategoryFields
            categories={categories}
            categoryId={draft.categoryId}
            customCategory={draft.customCategory}
            onCategoryIdChange={(categoryId) => {
              const selected = categories.find(
                (category) => category.id === categoryId,
              );
              onChange({
                categoryId,
                customCategory:
                  selected && isOtherCategory(selected)
                    ? draft.customCategory
                    : "",
              });
            }}
            onCustomCategoryChange={(customCategory) =>
              onChange({ customCategory })
            }
            categoryError={fieldErrors.categoryId}
            customCategoryError={fieldErrors.customCategory}
            required
          />
        )}

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

        <Field label="Logo URL" htmlFor="business-logo" error={fieldErrors.logoUrl}>
          <Input
            id="business-logo"
            value={draft.logoUrl}
            onChange={(event) => onChange({ logoUrl: event.target.value })}
            placeholder="https://"
          />
        </Field>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" className="flex-1" onClick={onContinue}>
          Continue
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
            <Input
              id="state"
              value={draft.state}
              onChange={(event) => onChange({ state: event.target.value })}
              autoComplete="address-level1"
            />
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

function ClaimStep({
  search,
  searching,
  results,
  error,
  claimMessage,
  submitting,
  onSearch,
  onClaim,
  onBack,
}: {
  search: string;
  searching: boolean;
  results: BusinessSearchResult[];
  error: string | null;
  claimMessage: string | null;
  submitting: boolean;
  onSearch: (value: string) => void;
  onClaim: (id: string, isClaimed: boolean) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Claim a business</h1>
        <Paragraph className="text-muted-foreground">
          Search for a listed business. Claim requests are reviewed before ownership
          is granted.
        </Paragraph>
      </div>

      {error ? <StatusAlert status="error" title="Unable to continue" description={error} /> : null}
      {claimMessage ? (
        <StatusAlert status="success" title="Claim update" description={claimMessage} />
      ) : null}

      <Field label="Search" htmlFor="business-search">
        <Input
          id="business-search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Business name"
        />
      </Field>

      {searching ? <Muted className="text-sm">Searching…</Muted> : null}

      {results.length > 0 ? (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {results.map((result) => (
            <li key={result.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{result.name}</p>
                <Muted className="text-sm">
                  {[result.categoryName, [result.city, result.state].filter(Boolean).join(", ")]
                    .filter(Boolean)
                    .join(" · ")}
                  {result.isClaimed ? " · Claimed" : " · Unclaimed"}
                </Muted>
              </div>
              {result.isClaimed ? (
                <Muted className="text-sm">This business is already claimed.</Muted>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={submitting}
                  onClick={() => onClaim(result.id, result.isClaimed)}
                >
                  Request to Claim
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : search.trim().length >= 2 && !searching ? (
        <Muted className="text-sm">No matching businesses yet.</Muted>
      ) : null}

      <Button type="button" variant="outline" onClick={onBack}>
        Back
      </Button>
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
          {businessName} now has a live Meritt profile.
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

function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
