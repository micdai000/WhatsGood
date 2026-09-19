import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { ShareProfileButton } from "@/components/business-dashboard/share-profile-button";
import { ProfessionalLinksSection } from "@/components/profile/professional-links-section";
import { AccountPhotoEditor } from "@/components/profile-fields/account-photo-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusAlert } from "@/components/ui/status-alert";
import { Muted } from "@/components/typography/typography";
import { useAuthContext } from "@/contexts/auth-context";
import { useBusinessWorkspace } from "@/contexts/business-workspace-context";
import { getAccountDisplayName } from "@/lib/auth/display-name";
import { getPublicBusinessPath, getPublicBusinessUrl } from "@/lib/business/public-url";
import { cn } from "@/lib/utils";
import { persistAccountPhoto } from "@/lib/profile/persist-account-photo";
import { BusinessCategoryFields } from "@/components/business/category-fields";
import {
  isOtherCategory,
} from "@/lib/business/categories";
import { LIMITS } from "@/lib/constants";
import {
  normalizeSocialLinksForSave,
  socialLinksForBusiness,
  socialLinksToFormValues,
  toSocialInputValue,
  type SocialLinkPlatform,
  validateSocialLinksFormValues,
  validateSocialUsernameInput,
  validateWebsiteInput,
} from "@/lib/profile/social-links";
import { businessService } from "@/services/businesses";
import { DEFAULT_SOCIAL_LINKS, isFailure } from "@/types";
import type { SocialLinks } from "@/types";

export default function DashboardProfilePage() {
  const { user, refresh: refreshAuth } = useAuthContext();
  const { currentBusiness, categories, refresh } = useBusinessWorkspace();
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    currentBusiness?.logoUrl ?? user?.avatarUrl ?? null,
  );
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(() =>
    toSocialFormValues(currentBusiness?.socialLinks, currentBusiness?.websiteUrl),
  );
  const [socialErrors, setSocialErrors] = useState<
    Partial<Record<SocialLinkPlatform, string>>
  >({});
  const [categoryId, setCategoryId] = useState(
    currentBusiness?.categoryId ?? "",
  );
  const [customCategory, setCustomCategory] = useState(
    currentBusiness?.customCategory ?? "",
  );
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [customCategoryError, setCustomCategoryError] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSocialLinks(
      toSocialFormValues(currentBusiness?.socialLinks, currentBusiness?.websiteUrl),
    );
    setSocialErrors({});
    setCategoryId(currentBusiness?.categoryId ?? "");
    setCustomCategory(currentBusiness?.customCategory ?? "");
    setCategoryError(null);
    setCustomCategoryError(null);
  }, [
    currentBusiness?.id,
    currentBusiness?.socialLinks,
    currentBusiness?.websiteUrl,
    currentBusiness?.categoryId,
    currentBusiness?.customCategory,
  ]);

  const updateSocialLink = useCallback((platform: SocialLinkPlatform, value: string) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value,
    }));
    setMessage(null);
    setError(null);
    setSocialErrors((prev) => {
      if (!prev[platform]) return prev;
      const next = { ...prev };
      delete next[platform];
      return next;
    });
  }, []);

  const handleSocialBlur = useCallback(
    (platform: SocialLinkPlatform, rawValue: string) => {
      const fieldError =
        platform === "website"
          ? validateWebsiteInput(rawValue)
          : validateSocialUsernameInput(platform, rawValue);

      setSocialErrors((prev) => {
        const next = { ...prev };
        if (fieldError) {
          next[platform] = fieldError;
        } else {
          delete next[platform];
        }
        return next;
      });

      if (fieldError || !rawValue.trim()) return;

      if (platform === "website") {
        const normalized = normalizeSocialLinksForSave({
          ...DEFAULT_SOCIAL_LINKS,
          website: rawValue,
        }).website;
        if (normalized && normalized !== rawValue) {
          updateSocialLink("website", normalized);
        }
        return;
      }

      const username = toSocialInputValue(
        platform,
        normalizeSocialLinksForSave({
          ...DEFAULT_SOCIAL_LINKS,
          [platform]: rawValue,
        })[platform],
      );

      if (username && username !== rawValue.trim()) {
        updateSocialLink(platform, username);
      }
    },
    [updateSocialLink],
  );

  if (!currentBusiness || !user) {
    return null;
  }

  const displayName = getAccountDisplayName({
    fullName: user.fullName,
    email: user.email,
  });

  async function persistPhoto(url: string | null) {
    if (!currentBusiness) return;
    const previous = photoUrl;
    setPhotoUrl(url);
    setError(null);
    setMessage(null);

    try {
      await persistAccountPhoto({
        url,
        businessId: currentBusiness.id,
      });
      setMessage("Profile photo updated.");
      await Promise.all([refresh(), refreshAuth()]);
    } catch (caught) {
      setPhotoUrl(previous);
      const persistError =
        caught instanceof Error && caught.message
          ? caught.message
          : "Unable to update your photo.";
      setError(persistError);
      throw new Error(persistError);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentBusiness) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    setMessage(null);
    setCategoryError(null);
    setCustomCategoryError(null);

    const nextSocialErrors = validateSocialLinksFormValues(socialLinks);
    if (Object.keys(nextSocialErrors).length > 0) {
      setSocialErrors(nextSocialErrors);
      setSaving(false);
      return;
    }

    const normalizedLinks = normalizeSocialLinksForSave(socialLinks);
    const website = normalizedLinks.website.trim();

    const selected = categories.find((category) => category.id === categoryId);
    if (!categoryId) {
      setCategoryError("Please select a category");
      setSaving(false);
      return;
    }
    if (
      selected &&
      isOtherCategory(selected) &&
      customCategory.trim().length < LIMITS.CUSTOM_CATEGORY_MIN_LENGTH
    ) {
      setCustomCategoryError("Please describe your category");
      setSaving(false);
      return;
    }

    const result = await businessService.updateBusiness(currentBusiness.id, {
      name: String(form.get("name") ?? ""),
      description: empty(form.get("description")),
      websiteUrl: website ? website : null,
      socialLinks: normalizedLinks,
      phone: empty(form.get("phone")),
      email: empty(form.get("email")),
      logoUrl: photoUrl,
      categoryId,
      customCategory: customCategory.trim() || null,
    });

    setSaving(false);
    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }

    setSocialLinks(socialLinksToFormValues(result.data.socialLinks));
    setMessage("Business profile saved.");
    await refresh();
  }

  return (
    <div className="space-y-8">
      <DashboardCard title="Your profile">
        <Muted className="text-sm">
          This is the name from your account, and the photo customers see on
          your public profile.
        </Muted>
        <div className="mt-5">
          <AccountPhotoEditor
            value={photoUrl}
            displayName={displayName}
            onChange={persistPhoto}
          />
        </div>
      </DashboardCard>

      <DashboardCard title="Public profile">
        <Muted className="text-sm">
          Share your Meritt page so customers can see your current reputation.
        </Muted>
        <div className="mt-4 flex flex-wrap gap-3">
          <ShareProfileButton
            url={getPublicBusinessUrl(currentBusiness.slug)}
            title={currentBusiness.name}
          />
          <CopyLinkButton
            url={getPublicBusinessUrl(currentBusiness.slug)}
            label="Copy Profile Link"
          />
          <Link
            to={getPublicBusinessPath(currentBusiness.slug)}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Open Public Profile
          </Link>
        </div>
      </DashboardCard>

      <DashboardCard title="Locations">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Muted className="text-sm">
            Add or update the places customers visit.
          </Muted>
          <Link
            to="/dashboard/locations"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Manage locations
          </Link>
        </div>
      </DashboardCard>

      <DashboardCard title="Business profile">
        <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
        {error ? <StatusAlert status="error" title="Unable to save" description={error} /> : null}
        {message ? <StatusAlert status="success" title="Saved" description={message} /> : null}

        <div className="space-y-2">
          <Label htmlFor="name">Business name</Label>
          <Input id="name" name="name" defaultValue={currentBusiness.name} required />
        </div>
        <BusinessCategoryFields
          categories={categories}
          categoryId={categoryId}
          customCategory={customCategory}
          onCategoryIdChange={(nextId) => {
            const selected = categories.find((category) => category.id === nextId);
            setCategoryId(nextId);
            setCategoryError(null);
            setCustomCategoryError(null);
            if (!selected || !isOtherCategory(selected)) {
              setCustomCategory("");
            }
          }}
          onCustomCategoryChange={(value) => {
            setCustomCategory(value);
            setCustomCategoryError(null);
          }}
          categoryError={categoryError ?? undefined}
          customCategoryError={customCategoryError ?? undefined}
          selectId="categoryId"
          customId="customCategory"
        />
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={currentBusiness.description ?? ""}
            rows={4}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={currentBusiness.phone ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={currentBusiness.email ?? ""} />
          </div>
        </div>

        <section className="space-y-4 border-t border-border pt-4" aria-labelledby="professional-links-heading">
          <div className="space-y-1">
            <h3 id="professional-links-heading" className="text-sm font-semibold">
              Professional links
            </h3>
            <Muted className="text-sm">
              Add Instagram, Facebook, or X. Icons appear on your public profile
              when you save a link.
            </Muted>
          </div>
          <ProfessionalLinksSection
            values={socialLinks}
            errors={socialErrors}
            onChange={updateSocialLink}
            onBlur={handleSocialBlur}
            platforms={["instagram", "facebook", "x"]}
            embedded
          />
        </section>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </DashboardCard>
    </div>
  );
}

function toSocialFormValues(
  socialLinks?: SocialLinks | null,
  websiteUrl?: string | null,
): SocialLinks {
  return socialLinksToFormValues(
    socialLinksForBusiness({ socialLinks, websiteUrl }),
  );
}

function empty(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}
