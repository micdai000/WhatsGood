import { Link } from "react-router-dom";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyDashboard } from "@/components/dashboard/empty-dashboard";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { QrImage } from "@/components/business-dashboard/qr-image";
import { Button, buttonVariants } from "@/components/ui/button";
import { Muted } from "@/components/typography/typography";
import { downloadQrPng } from "@/lib/qr/download-png";
import { getQrUrl } from "@/lib/qr/destination";
import { cn } from "@/lib/utils";
import type { Business, BusinessQrCode } from "@/types";

interface QrCodePanelProps {
  business: Business;
  qrCode: BusinessQrCode | null;
}

export function QrCodePanel({ business, qrCode }: QrCodePanelProps) {
  if (!qrCode) {
    return (
      <EmptyDashboard
        title="No QR code yet"
        description="A QR code will appear here once one is created for this business."
      />
    );
  }

  const destination = getQrUrl(qrCode.code);

  return (
    <DashboardCard title="Your Meritt QR Code">
      <div className="grid gap-6 sm:grid-cols-[280px_1fr] sm:items-start">
        <QrImage
          destination={destination}
          size={280}
          alt={`QR code for ${business.name}`}
          className="mx-auto size-[280px] rounded-lg border border-border bg-white p-3"
        />
        <div className="space-y-4">
          <div>
            <p className="font-medium">{business.name}</p>
            <Muted className="text-sm">{qrCode.label ?? "Primary Business QR"}</Muted>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Destination</p>
            <p className="break-all text-sm text-muted-foreground">{destination}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/q/${qrCode.code}`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants())}
            >
              View QR
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void downloadQrPng(destination, `${business.slug || "meritt"}-qr.png`)
              }
            >
              Download
            </Button>
            <CopyLinkButton url={destination} label="Copy Link" />
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
