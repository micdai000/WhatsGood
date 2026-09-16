import { Link, useParams } from "react-router-dom";
import { QrImage } from "@/components/business-dashboard/qr-image";
import { LoadingState } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import { buttonVariants } from "@/components/ui/button";
import { useBusinessWorkspace } from "@/contexts/business-workspace-context";
import { getQrUrl } from "@/lib/qr/destination";
import { SITE_NAME } from "@/lib/seo/site";
import { cn } from "@/lib/utils";

export default function QrPrintPage() {
  const { id } = useParams();
  const { currentBusiness, qrCodes, qrReady, loading } = useBusinessWorkspace();

  if (loading || !qrReady) {
    return <LoadingState label="Preparing print layout…" fullPage />;
  }

  const qr = qrCodes.find((item) => item.id === id);
  if (!currentBusiness || !qr) {
    return (
      <ErrorState
        title="QR code not found"
        description="This QR code is not available for the selected business."
      />
    );
  }

  const destination = getQrUrl(qr.code);

  return (
    <div className="mx-auto max-w-md space-y-8 px-6 py-10 text-center print:max-w-none print:px-0 print:py-16">
      <QrImage
        destination={destination}
        size={800}
        alt={`QR code for ${currentBusiness.name}`}
        className="mx-auto size-[320px] bg-white p-3 print:size-[360px]"
      />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{currentBusiness.name}</h1>
        <p className="text-muted-foreground">See us on Meritt</p>
      </div>
      <p className="text-sm font-medium">{SITE_NAME}</p>
      <div className="flex justify-center gap-3 print:hidden">
        <button
          type="button"
          className={cn(buttonVariants())}
          onClick={() => window.print()}
        >
          Print
        </button>
        <Link to="/dashboard/qr" className={cn(buttonVariants({ variant: "outline" }))}>
          Back
        </Link>
      </div>
    </div>
  );
}
