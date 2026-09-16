import { Link, useParams } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/layout/empty-state";
import { LoadingState } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import { PublicBusinessView } from "@/components/public-business/public-business-view";
import { buttonVariants } from "@/components/ui/button";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { useServiceQuery } from "@/hooks/use-service-query";
import { getCanonicalUrl, SITE_NAME } from "@/lib/seo/site";
import { getQrPath } from "@/lib/qr/destination";
import { cn } from "@/lib/utils";
import { businessService } from "@/services/businesses";
import { qrCodeService } from "@/services/qr";
import { isFailure, success } from "@/types";
import type {
  Business,
  BusinessCategory,
  BusinessLocation,
  PublicBusinessQrCode,
  ServiceResult,
} from "@/types";

type QrExperience =
  | { kind: "not_found" }
  | { kind: "inactive" }
  | { kind: "unavailable" }
  | {
      kind: "ok";
      business: Business;
      category: BusinessCategory | null;
      location: BusinessLocation | null;
      qr: PublicBusinessQrCode;
    };

export default function PublicQrPage() {
  const { code } = useParams();
  const result = useServiceQuery(() => loadQrExperience(code), [code]);

  if (result.status === "loading") {
    return <LoadingState label="Opening business…" fullPage />;
  }

  if (result.status === "error") {
    return (
      <Section>
        <Container className="max-w-lg">
          <ErrorState
            title="Unable to open this QR code"
            description="Something went wrong while opening this Meritt code."
          />
        </Container>
      </Section>
    );
  }

  if (result.data.kind !== "ok") {
    return <QrStatusPage kind={result.data.kind} />;
  }

  return <QrReadyPage data={result.data} />;
}

function QrStatusPage({
  kind,
}: {
  kind: "not_found" | "inactive" | "unavailable";
}) {
  const copy =
    kind === "inactive"
      ? {
          title: "This QR code is inactive.",
          description: "The business may have replaced this QR code.",
        }
      : kind === "unavailable"
        ? {
            title: "This business is currently unavailable on Meritt.",
            description: "Please check back later or contact the business directly.",
          }
        : {
            title: "QR code not found",
            description: "This Meritt QR code doesn't appear to be valid.",
          };

  return (
    <Section>
      <Container className="max-w-lg">
        <EmptyState
          title={copy.title}
          description={copy.description}
          action={
            <Link to="/" className={cn(buttonVariants())}>
              Go to Meritt
            </Link>
          }
        />
      </Container>
    </Section>
  );
}

function QrReadyPage({
  data,
}: {
  data: {
    kind: "ok";
    business: Business;
    category: BusinessCategory | null;
    location: BusinessLocation | null;
    qr: PublicBusinessQrCode;
  };
}) {
  useDocumentMeta({
    title: `${data.business.name} | ${SITE_NAME}`,
    description: `See the current reputation of ${data.business.name} on Meritt.`,
    url: getCanonicalUrl(getQrPath(data.qr.code)),
  });

  return (
    <Section>
      <Container className="max-w-lg">
        <PublicBusinessView
          business={data.business}
          category={data.category}
          location={data.location}
          qr={data.qr}
        />
      </Container>
    </Section>
  );
}

async function loadQrExperience(
  code: string | undefined,
): Promise<ServiceResult<QrExperience>> {
  if (!code) {
    return success({ kind: "not_found" });
  }

  const resolved = await qrCodeService.resolvePublicQr(code);
  if (isFailure(resolved)) {
    return resolved;
  }

  if (resolved.data.status !== "ok") {
    return success({ kind: resolved.data.status });
  }

  const { qr, slug } = resolved.data;
  const businessResult = await businessService.getBusinessBySlug(slug);
  if (isFailure(businessResult)) {
    return success({ kind: "unavailable" });
  }

  const [categoriesResult, locationsResult] = await Promise.all([
    businessService.getCategories(),
    businessService.getLocations(businessResult.data.id),
  ]);
  const category = isFailure(categoriesResult)
    ? null
    : (categoriesResult.data.find(
        (item) => item.id === businessResult.data.categoryId,
      ) ?? null);
  const locations = isFailure(locationsResult) ? [] : locationsResult.data;
  const location =
    (qr.locationId
      ? locations.find((item) => item.id === qr.locationId)
      : null) ??
    locations.find((item) => item.isPrimary) ??
    locations[0] ??
    null;

  return success({
    kind: "ok",
    business: businessResult.data,
    category,
    location,
    qr,
  });
}
