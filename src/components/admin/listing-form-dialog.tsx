import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { BusinessCategoryFields } from "@/components/business/category-fields";
import { BusinessLogoField } from "@/components/business/business-logo-field";
import {
  FormField as Field,
  SELECT_CLASS_NAME,
} from "@/components/business-onboarding/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { isOtherCategory } from "@/lib/business/categories";
import { LIMITS } from "@/lib/constants";
import { US_STATE_CODES } from "@/lib/location/us-states";
import { completeBusinessOnboardingSchema } from "@/lib/validators";
import { adminBusinessService } from "@/services/admin";
import { businessService } from "@/services/businesses";
import { isFailure } from "@/types";
import type { BusinessCategory } from "@/types";

interface ListingDraft {
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
}

const EMPTY_DRAFT: ListingDraft = {
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
};

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function withHttps(value: string): string | undefined {
  const trimmed = optional(value);
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function ListingFormDialog({
  businessId,
  onSaved,
}: {
  businessId?: string;
  onSaved: () => void;
}) {
  const isEdit = Boolean(businessId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ListingDraft>(EMPTY_DRAFT);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    setFieldErrors({});
    setLoading(true);

    void (async () => {
      const [categoriesResult, listingResult] = await Promise.all([
        businessService.getCategories(),
        businessId ? adminBusinessService.getListing(businessId) : null,
      ]);
      if (cancelled) return;

      if (!isFailure(categoriesResult)) {
        setCategories(categoriesResult.data);
      }

      if (listingResult) {
        if (isFailure(listingResult)) {
          setError(listingResult.error.message);
        } else {
          const { business, location } = listingResult.data;
          setLocationId(location?.id ?? null);
          setDraft({
            name: business.name,
            categoryId: business.categoryId ?? "",
            customCategory: business.customCategory ?? "",
            description: business.description ?? "",
            websiteUrl: business.websiteUrl ?? "",
            phone: business.phone ?? "",
            email: business.email ?? "",
            logoUrl: business.logoUrl ?? "",
            addressLine1: location?.addressLine1 ?? "",
            city: location?.city ?? "",
            state: location?.state ?? "",
            postalCode: location?.postalCode ?? "",
          });
        }
      } else {
        setDraft(EMPTY_DRAFT);
        setLocationId(null);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, businessId]);

  function update(patch: Partial<ListingDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = completeBusinessOnboardingSchema.safeParse({
      name: draft.name,
      categoryId: draft.categoryId,
      customCategory: optional(draft.customCategory) ?? null,
      description: optional(draft.description),
      websiteUrl: withHttps(draft.websiteUrl),
      phone: optional(draft.phone),
      email: optional(draft.email),
      logoUrl: optional(draft.logoUrl),
      addressLine1: optional(draft.addressLine1),
      city: draft.city,
      state: draft.state,
      postalCode: optional(draft.postalCode),
      country: "US",
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "name");
        next[key] ??= issue.message;
      }
      setFieldErrors(next);
      return;
    }

    const selected = categories.find((category) => category.id === draft.categoryId);
    if (
      selected &&
      isOtherCategory(selected) &&
      draft.customCategory.trim().length < LIMITS.CUSTOM_CATEGORY_MIN_LENGTH
    ) {
      setFieldErrors({ customCategory: "Please describe the category" });
      return;
    }

    setFieldErrors({});
    setSaving(true);
    const result = businessId
      ? await adminBusinessService.updateListing(businessId, locationId, parsed.data)
      : await adminBusinessService.createListing(parsed.data);
    setSaving(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setOpen(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant={isEdit ? "outline" : "default"} size="sm">
            {isEdit ? (
              "Edit"
            ) : (
              <>
                <Plus className="size-4" aria-hidden />
                Add listing
              </>
            )}
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit listing" : "Add a business listing"}</DialogTitle>
          <DialogDescription>
            Public profile information only. Copy the phone, email, and website
            from the business&apos;s own website or Google listing — owners
            verify their claim through these.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit} noValidate>
            <Field label="Business name" htmlFor="listing-name" error={fieldErrors.name} required>
              <Input
                id="listing-name"
                value={draft.name}
                onChange={(event) => update({ name: event.target.value })}
              />
            </Field>

            <BusinessCategoryFields
              categories={categories}
              categoryId={draft.categoryId}
              customCategory={draft.customCategory}
              onCategoryIdChange={(categoryId) => {
                const selected = categories.find((category) => category.id === categoryId);
                update({
                  categoryId,
                  customCategory:
                    selected && isOtherCategory(selected) ? draft.customCategory : "",
                });
              }}
              onCustomCategoryChange={(customCategory) => update({ customCategory })}
              categoryError={fieldErrors.categoryId}
              customCategoryError={fieldErrors.customCategory}
              selectId="listing-category"
              customId="listing-custom-category"
              required
            />

            <Field label="Description" htmlFor="listing-description" error={fieldErrors.description}>
              <Textarea
                id="listing-description"
                value={draft.description}
                onChange={(event) => update({ description: event.target.value })}
                rows={3}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Phone" htmlFor="listing-phone" error={fieldErrors.phone}>
                <Input
                  id="listing-phone"
                  value={draft.phone}
                  onChange={(event) => update({ phone: event.target.value })}
                />
              </Field>
              <Field label="Email" htmlFor="listing-email" error={fieldErrors.email}>
                <Input
                  id="listing-email"
                  type="email"
                  value={draft.email}
                  onChange={(event) => update({ email: event.target.value })}
                />
              </Field>
              <Field label="Website" htmlFor="listing-website" error={fieldErrors.websiteUrl}>
                <Input
                  id="listing-website"
                  value={draft.websiteUrl}
                  onChange={(event) => update({ websiteUrl: event.target.value })}
                  placeholder="https://"
                />
              </Field>
            </div>

            <BusinessLogoField
              id="listing-logo"
              value={draft.logoUrl}
              onChange={(logoUrl) => update({ logoUrl })}
              onUploadingChange={setUploadingLogo}
            />

            <Field label="Street address" htmlFor="listing-address" error={fieldErrors.addressLine1}>
              <Input
                id="listing-address"
                value={draft.addressLine1}
                onChange={(event) => update({ addressLine1: event.target.value })}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City" htmlFor="listing-city" error={fieldErrors.city} required>
                <Input
                  id="listing-city"
                  value={draft.city}
                  onChange={(event) => update({ city: event.target.value })}
                />
              </Field>
              <Field label="State" htmlFor="listing-state" error={fieldErrors.state} required>
                <select
                  id="listing-state"
                  value={draft.state}
                  onChange={(event) => update({ state: event.target.value })}
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
              <Field label="Postal code" htmlFor="listing-postal" error={fieldErrors.postalCode}>
                <Input
                  id="listing-postal"
                  value={draft.postalCode}
                  onChange={(event) => update({ postalCode: event.target.value })}
                />
              </Field>
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <DialogFooter>
              <Button type="submit" disabled={saving || uploadingLogo}>
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  "Create listing"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
