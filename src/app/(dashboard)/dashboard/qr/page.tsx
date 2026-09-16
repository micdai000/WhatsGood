import { QrManager } from "@/components/business-dashboard/qr-manager";
import { LoadingState } from "@/components/layout/loading-state";
import { useBusinessWorkspace } from "@/contexts/business-workspace-context";

export default function DashboardQrPage() {
  const { currentBusiness, qrCodes, qrReady, locations, refresh, loadQrCodes } =
    useBusinessWorkspace();

  if (!currentBusiness) {
    return null;
  }

  if (!qrReady) {
    return <LoadingState label="Loading QR codes…" />;
  }

  return (
    <QrManager
      business={currentBusiness}
      qrCodes={qrCodes}
      locations={locations}
      onChanged={async () => {
        await Promise.all([refresh(), loadQrCodes(currentBusiness.id)]);
      }}
    />
  );
}
