import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { ShareProfileButton } from "@/components/business-dashboard/share-profile-button";
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
import { businessService } from "@/services/businesses";
import { isFailure } from "@/types";

export default function DashboardProfilePage() {
  const { user, refresh: refreshAuth } = useAuthContext();
  const { currentBusiness, categories, refresh } = useBusinessWorkspace();
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    currentBusiness?.logoUrl ?? user?.avatarUrl ?? null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    const result = await businessService.updateBusiness(currentBusiness.id, {
      name: String(form.get("name") ?? ""),
      description: empty(form.get("description")),
      websiteUrl: empty(form.get("websiteUrl")),
      phone: empty(form.get("phone")),
      email: empty(form.get("email")),
      logoUrl: photoUrl,
      categoryId: empty(form.get("categoryId")),
    });

    setSaving(false);
    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }

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
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website</Label>
            <Input
              id="websiteUrl"
              name="websiteUrl"
              defaultValue={currentBusiness.websiteUrl ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={currentBusiness.phone ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={currentBusiness.email ?? ""} />
          </div>
        </div>
          <Button type="submit" disabled={saving}>
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
