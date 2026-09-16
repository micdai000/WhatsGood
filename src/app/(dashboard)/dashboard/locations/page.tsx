import { useState } from "react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyDashboard } from "@/components/dashboard/empty-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusAlert } from "@/components/ui/status-alert";
import { Muted } from "@/components/typography/typography";
import { useBusinessWorkspace } from "@/contexts/business-workspace-context";
import { businessService } from "@/services/businesses";
import { isFailure } from "@/types";
import type { BusinessLocation } from "@/types";

export default function DashboardLocationsPage() {
  const { currentBusiness, locations, refresh } = useBusinessWorkspace();
  const [editing, setEditing] = useState<BusinessLocation | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!currentBusiness) {
    return null;
  }

  async function save(event: React.FormEvent<HTMLFormElement>, locationId?: string) {
    event.preventDefault();
    if (!currentBusiness) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);

    const payload = {
      name: empty(form.get("name")),
      addressLine1: empty(form.get("addressLine1")),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      postalCode: empty(form.get("postalCode")),
      country: String(form.get("country") ?? "US"),
      phone: empty(form.get("phone")),
      isPrimary: form.get("isPrimary") === "on",
    };

    const result = locationId
      ? await businessService.updateLocation(locationId, payload)
      : await businessService.createLocation({
          businessId: currentBusiness.id,
          ...payload,
        });

    setSaving(false);
    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }

    setAdding(false);
    setEditing(null);
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Locations</h2>
        <Button type="button" variant="outline" onClick={() => setAdding(true)}>
          Add location
        </Button>
      </div>

      {error ? <StatusAlert status="error" title="Unable to save location" description={error} /> : null}

      {adding ? (
        <DashboardCard title="New location">
          <LocationForm
            saving={saving}
            onCancel={() => setAdding(false)}
            onSubmit={(event) => void save(event)}
          />
        </DashboardCard>
      ) : null}

      {locations.length === 0 && !adding ? (
        <EmptyDashboard
          title="No locations yet"
          description="Add your primary location so customers can find you."
        />
      ) : (
        <ul className="space-y-3">
          {locations.map((location) => (
            <li key={location.id}>
              <DashboardCard>
                {editing?.id === location.id ? (
                  <LocationForm
                    location={location}
                    saving={saving}
                    onCancel={() => setEditing(null)}
                    onSubmit={(event) => void save(event, location.id)}
                  />
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">
                        {location.name || [location.city, location.state].join(", ")}
                        {location.isPrimary ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            Primary
                          </span>
                        ) : null}
                      </p>
                      <Muted className="text-sm">
                        {[location.addressLine1, location.city, location.state, location.postalCode]
                          .filter(Boolean)
                          .join(", ")}
                      </Muted>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditing(location)}>
                      Edit
                    </Button>
                  </div>
                )}
              </DashboardCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LocationForm({
  location,
  saving,
  onCancel,
  onSubmit,
}: {
  location?: BusinessLocation;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Label</Label>
        <Input id="name" name="name" defaultValue={location?.name ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address</Label>
        <Input
          id="addressLine1"
          name="addressLine1"
          defaultValue={location?.addressLine1 ?? ""}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={location?.city ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" defaultValue={location?.state ?? ""} required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal code</Label>
          <Input id="postalCode" name="postalCode" defaultValue={location?.postalCode ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={location?.country ?? "US"} maxLength={2} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={location?.phone ?? ""} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPrimary" defaultChecked={location?.isPrimary} />
        Primary location
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function empty(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}
