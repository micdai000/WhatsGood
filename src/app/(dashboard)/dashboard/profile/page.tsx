import { useEffect, useState } from "react";
import { BusinessLogoField } from "@/components/business/business-logo-field";
import { Link } from "react-router-dom";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { ShareProfileButton } from "@/components/business-dashboard/share-profile-button";
import { ProfessionalLinksSection } from "@/components/profile/professional-links-section";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusAlert } from "@/components/ui/status-alert";
import { Muted } from "@/components/typography/typography";
import { useBusinessWorkspace } from "@/contexts/business-workspace-context";
import { getPublicBusinessPath, getPublicBusinessUrl } from "@/lib/business/public-url";
import {
  normalizeSocialLinksForSave,
  socialLinksToFormValues,
  validateSocialLinksFormValues,
  type SocialLinkPlatform,
} from "@/lib/profile/social-links";
import { cn } from "@/lib/utils";
import { businessService } from "@/services/businesses";
import { isFailure } from "@/types";
import type { SocialLinks } from "@/types";
import { DEFAULT_SOCIAL_LINKS } from "@/types/profile";

export default function DashboardProfilePage() {
  const { currentBusiness, categories, refresh } = useBusinessWorkspace();
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState(currentBusiness?.logoUrl ?? "");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(
    socialLinksToFormValues(currentBusiness?.socialLinks ?? DEFAULT_SOCIAL_LINKS),
  );
  const [socialErrors, setSocialErrors] = useState<
    Partial<Record<SocialLinkPlatform, string>>
  >({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLogoUrl(currentBusiness?.logoUrl ?? "");
    setSocialLinks(socialLinksToFormValues(currentBusiness?.socialLinks ?? DEFAULT_SOCIAL_LINKS));
    setSocialErrors({});
  }, [currentBusiness?.id, currentBusiness?.logoUrl, currentBusiness?.socialLinks]);

  if (!currentBusiness) {
    return null;
  }

  function onSocialChange(platform: SocialLinkPlatform, value: string) {
    setSocialLinks((current) => ({ ...current, [platform]: value }));
    setSocialErrors((current) => {
      if (!current[platform]) return current;
      const next = { ...current };
      delete next[platform];
      return next;
    });
  }

  function onSocialBlur(platform: SocialLinkPlatform, value: string) {
    const nextValues = { ...socialLinks, [platform]: value };
    const errors = validateSocialLinksFormValues(nextValues);
    setSocialErrors((current) => {
      const next = { ...current };
      if (errors[platform]) {
        next[platform] = errors[platform];
      } else {
        delete next[platform];
      }
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentBusiness) return;
    const form = new FormData(event.currentTarget);
    const linkErrors = validateSocialLinksFormValues(socialLinks);
    if (Object.keys(linkErrors).length > 0) {
      setSocialErrors(linkErrors);
      setError("Fix the professional links before saving.");
      return;
    }

    const normalizedLinks = normalizeSocialLinksForSave(socialLinks);
    setSaving(true);
    setError(null);
    setMessage(null);

    const result = await businessService.updateBusiness(currentBusiness.id, {
      name: String(form.get("name") ?? ""),
      description: empty(form.get("description")),
      websiteUrl: normalizedLinks.website || null,
      phone: empty(form.get("phone")),
      email: empty(form.get("email")),
      logoUrl: logoUrl.trim() ? logoUrl.trim() : null,
      categoryId: empty(form.get("categoryId")),
      socialLinks: normalizedLinks,
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
          {error ? (
            <StatusAlert status="error" title="Unable to save" description={error} />
          ) : null}
          {message ? (
            <StatusAlert status="success" title="Saved" description={message} />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="name">Business name</Label>
            <Input id="name" name="name" defaultValue={currentBusiness.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={currentBusiness.categoryId ?? ""}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
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
            <div className="sm:col-span-2">
              <BusinessLogoField
                id="logoUrl"
                value={logoUrl}
                onChange={setLogoUrl}
                onUploadingChange={setUploadingLogo}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={currentBusiness.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={currentBusiness.email ?? ""}
              />
            </div>
          </div>

          <ProfessionalLinksSection
            values={socialLinks}
            errors={socialErrors}
            onChange={onSocialChange}
            onBlur={onSocialBlur}
            asCard={false}
          />

          <Button type="submit" disabled={saving || uploadingLogo}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </DashboardCard>
    </div>
  );
}

function empty(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}
