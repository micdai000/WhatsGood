import { Link, useParams } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/layout/empty-state";
import { LoadingState } from "@/components/layout/loading-state";
import { PublicBusinessView } from "@/components/public-business/public-business-view";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { useServiceQuery } from "@/hooks/use-service-query";
import { NotFoundError } from "@/lib/errors";
import { getPublicBusinessPath, getPublicBusinessUrl } from "@/lib/business/public-url";
import { getCanonicalUrl, SITE_NAME } from "@/lib/seo/site";
import { cn } from "@/lib/utils";
import { businessService } from "@/services/businesses";
import { failure, isFailure, success } from "@/types";
import type { Business, BusinessCategory, BusinessLocation } from "@/types";

export default function PublicBusinessPage() {
  const { slug } = useParams();
  const result = useServiceQuery(() => loadPublicBusiness(slug), [slug]);

  if (result.status === "loading") {
    return <LoadingState label="Loading business…" fullPage />;
  }

  if (result.status === "error") {
    return (
      <Section>
        <Container className="max-w-lg">
          <EmptyState
            title="Business not found"
            description="This Meritt business page is unavailable."
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

  return <PublicBusinessPageBody data={result.data} />;
}

function PublicBusinessPageBody({
  data,
}: {
  data: {
    business: Business;
    category: BusinessCategory | null;
    location: BusinessLocation | null;
  };
}) {
  const { business, category, location } = data;
  const path = getPublicBusinessPath(business.slug);
  useDocumentMeta({
    title: `${business.name} | ${SITE_NAME}`,
    description: `See the current reputation of ${business.name} on Meritt.`,
    url: getCanonicalUrl(path),
  });

  return (
    <Section>
      <Container className="max-w-lg">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: business.name,
            description: business.description ?? undefined,
            url: getPublicBusinessUrl(business.slug),
            telephone: business.phone ?? undefined,
            image: business.logoUrl ?? undefined,
            address: location
              ? {
                  "@type": "PostalAddress",
                  addressLocality: location.city,
                  addressRegion: location.state,
                }
              : undefined,
          }}
        />
        <PublicBusinessView
          business={business}
          category={category}
          location={location}
        />
      </Container>
    </Section>
  );
}

async function loadPublicBusiness(slug: string | undefined) {
  if (!slug) {
    return failure(new NotFoundError("Business"));
  }

  const businessResult = await businessService.getBusinessBySlug(slug);
  if (isFailure(businessResult)) {
    return businessResult;
  }

  const business = businessResult.data;
  if (business.status !== "active") {
    return failure(new NotFoundError("Business"));
  }

  const [categoriesResult, locationsResult] = await Promise.all([
    businessService.getCategories(),
    businessService.getLocations(business.id),
  ]);

  const category = isFailure(categoriesResult)
    ? null
    : (categoriesResult.data.find((item) => item.id === business.categoryId) ??
      null);
  const locations = isFailure(locationsResult) ? [] : locationsResult.data;
  const location =
    locations.find((item) => item.isPrimary) ?? locations[0] ?? null;

  return success({ business, category, location });
}
