import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyDashboard } from "@/components/dashboard/empty-dashboard";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { QrImage } from "@/components/business-dashboard/qr-image";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusAlert } from "@/components/ui/status-alert";
import { Muted } from "@/components/typography/typography";
import { downloadQrPng } from "@/lib/qr/download-png";
import { getQrUrl } from "@/lib/qr/destination";
import { cn } from "@/lib/utils";
import { qrCodeService } from "@/services/qr";
import { isFailure } from "@/types";
import type { Business, BusinessLocation, BusinessQrCode } from "@/types";

interface QrManagerProps {
  business: Business;
  qrCodes: BusinessQrCode[];
  locations: BusinessLocation[];
  onChanged: () => Promise<void>;
}

export function QrManager({
  business,
  qrCodes,
  locations,
  onChanged,
}: QrManagerProps) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function createQr(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setCreating(true);
    const result = await qrCodeService.createQrCode({
      businessId: business.id,
      label: empty(form.get("label")),
      locationId: empty(form.get("locationId")),
    });
    setCreating(false);
    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }
    event.currentTarget.reset();
    await onChanged();
  }

  async function rename(qr: BusinessQrCode, label: string) {
    setSavingId(qr.id);
    setError(null);
    const result = await qrCodeService.updateQrCode(qr.id, { label });
    setSavingId(null);
    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }
    await onChanged();
  }

  async function setActive(qr: BusinessQrCode, isActive: boolean) {
    setSavingId(qr.id);
    setError(null);
    const result = await qrCodeService.updateQrCode(qr.id, { isActive });
    setSavingId(null);
    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }
    await onChanged();
  }

  async function setLocation(qr: BusinessQrCode, locationId: string | null) {
    setSavingId(qr.id);
    setError(null);
    const result = await qrCodeService.updateQrCode(qr.id, { locationId });
    setSavingId(null);
    if (isFailure(result)) {
      setError(result.error.message);
      return;
    }
    await onChanged();
  }

  async function download(qr: BusinessQrCode) {
    try {
      await downloadQrPng(
        getQrUrl(qr.code),
        `${business.slug}-${qr.label || "qr"}.png`,
      );
    } catch {
      setError("Unable to download this QR code.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Your Meritt QR Code</h2>
        <Muted className="text-sm">
          Give customers a simple way to see your current reputation and share
          their experience.
        </Muted>
      </div>

      {error ? (
        <StatusAlert status="error" title="Unable to update QR code" description={error} />
      ) : null}

      <DashboardCard title="Create another QR code">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => void createQr(event)}>
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" name="label" placeholder="Front Door" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationId">Location</Label>
            <select
              id="locationId"
              name="locationId"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">Business-wide</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {locationLabel(location)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={creating}>
              {creating ? "Creating…" : "Create QR code"}
            </Button>
          </div>
        </form>
      </DashboardCard>

      {qrCodes.length === 0 ? (
        <EmptyDashboard
          title="No QR codes yet"
          description="Create a QR code so customers can find your Meritt page."
        />
      ) : (
        <ul className="space-y-4">
          {qrCodes.map((qr) => (
            <QrCard
              key={qr.id}
              business={business}
              qr={qr}
              locations={locations}
              busy={savingId === qr.id}
              onRename={rename}
              onSetActive={setActive}
              onSetLocation={setLocation}
              onDownload={download}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function QrCard({
  business,
  qr,
  locations,
  busy,
  onRename,
  onSetActive,
  onSetLocation,
  onDownload,
}: {
  business: Business;
  qr: BusinessQrCode;
  locations: BusinessLocation[];
  busy: boolean;
  onRename: (qr: BusinessQrCode, label: string) => Promise<void>;
  onSetActive: (qr: BusinessQrCode, isActive: boolean) => Promise<void>;
  onSetLocation: (qr: BusinessQrCode, locationId: string | null) => Promise<void>;
  onDownload: (qr: BusinessQrCode) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const destination = getQrUrl(qr.code);

  return (
    <li>
      <DashboardCard>
        <div className="grid gap-6 sm:grid-cols-[160px_1fr] sm:items-start">
          <QrImage
            destination={destination}
            size={280}
            alt={`QR code for ${business.name}`}
            className="mx-auto size-40 rounded-lg border border-border bg-white p-2"
          />
          <div className="space-y-4">
            {editing ? (
              <form
                className="flex flex-wrap gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const label = String(new FormData(event.currentTarget).get("label") ?? "");
                  void onRename(qr, label).then(() => setEditing(false));
                }}
              >
                <Input name="label" defaultValue={qr.label ?? ""} className="max-w-xs" />
                <Button type="submit" size="sm" disabled={busy}>
                  Save
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </form>
            ) : (
              <div>
                <p className="font-medium">{qr.label || "Untitled QR"}</p>
                <Muted className="text-sm">{qr.isActive ? "Active" : "Inactive"}</Muted>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor={`location-${qr.id}`}>Location</Label>
              <select
                id={`location-${qr.id}`}
                value={qr.locationId ?? ""}
                disabled={busy}
                onChange={(event) =>
                  void onSetLocation(qr, event.target.value || null)
                }
                className="h-8 w-full max-w-xs rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="">Business-wide</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {locationLabel(location)}
                  </option>
                ))}
              </select>
            </div>

            <p className="break-all text-sm text-muted-foreground">{destination}</p>

            <div className="flex flex-wrap gap-2">
              <Link
                to={`/q/${qr.code}`}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                View QR
              </Link>
              <Button type="button" size="sm" variant="outline" onClick={() => void onDownload(qr)}>
                Download
              </Button>
              <CopyLinkButton url={destination} label="Copy Link" className="h-8" />
              <Link
                to={`/dashboard/qr/print/${qr.id}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Print
              </Link>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(true)}>
                Rename
              </Button>
              {qr.isActive ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void onSetActive(qr, false)}
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void onSetActive(qr, true)}
                >
                  Reactivate
                </Button>
              )}
            </div>
          </div>
        </div>
      </DashboardCard>
    </li>
  );
}

function locationLabel(location: BusinessLocation): string {
  return location.name || [location.city, location.state].filter(Boolean).join(", ");
}

function empty(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}
