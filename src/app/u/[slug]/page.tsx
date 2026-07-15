import { useParams } from "react-router-dom";
import { PublicProfileView } from "@/components/profile/public-profile-view";
import ProfileNotFound from "@/app/u/[slug]/not-found";
import { JsonLd } from "@/components/seo/json-ld";
import { Spinner } from "@/components/ui/spinner";
import { useServiceQuery } from "@/hooks/use-service-query";
import { NotFoundError } from "@/lib/errors";
import { getCanonicalUrl } from "@/lib/seo/site";
import { getPublicProfilePath } from "@/lib/profile/public-url";
import { profileService } from "@/services/profiles/profile.service";
import { failure } from "@/types";

export default function PublicProfilePage() {
  const { slug } = useParams<{ slug: string }>();

  const result = useServiceQuery(
    () => {
      if (!slug) {
        return Promise.resolve(failure(new NotFoundError("Profile")));
      }
      return profileService.getPublicProfile(slug);
    },
    [slug],
  );

  if (!slug) {
    return <ProfileNotFound />;
  }

  if (result.status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (result.status === "error") {
    return <ProfileNotFound />;
  }

  const profile = result.data;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.displayName,
    description: profile.bio ?? undefined,
    url: getCanonicalUrl(getPublicProfilePath(profile.username)),
    jobTitle: profile.professionName ?? undefined,
    address: profile.city
      ? {
          "@type": "PostalAddress",
          addressLocality: profile.city,
          addressRegion: profile.state ?? undefined,
        }
      : undefined,
    aggregateRating:
      profile.totalReviews > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: profile.averageRating,
            reviewCount: profile.totalReviews,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <PublicProfileView profile={profile} />
    </>
  );
}
