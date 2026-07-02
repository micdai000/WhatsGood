import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileView } from "@/components/profile/public-profile-view";
import { JsonLd } from "@/components/seo/json-ld";
import { getCanonicalUrl } from "@/lib/seo/site";
import { profileService } from "@/services/profiles/profile.service";
import { isFailure } from "@/types";

export const dynamic = "force-dynamic";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await profileService.getPublicProfile(slug);

  if (isFailure(result)) {
    return { title: "Profile not found | TrustLoop" };
  }

  const { displayName, professionName, bio } = result.data;
  const description =
    bio?.trim() ||
    (professionName
      ? `${displayName} — ${professionName} on TrustLoop`
      : `${displayName} on TrustLoop`);

  const profileUrl = getCanonicalUrl(`/@${slug}`);

  return {
    title: displayName,
    description,
    alternates: {
      canonical: profileUrl,
    },
    openGraph: {
      title: `${displayName} | TrustLoop`,
      description,
      type: "profile",
      url: profileUrl,
    },
    twitter: {
      card: "summary",
      title: `${displayName} | TrustLoop`,
      description,
    },
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { slug } = await params;
  const result = await profileService.getPublicProfile(slug);

  if (isFailure(result)) {
    if (result.error.code === "NOT_FOUND") {
      notFound();
    }

    throw new Error(result.error.message);
  }

  const profile = result.data;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.displayName,
    description: profile.bio ?? undefined,
    url: getCanonicalUrl(`/@${profile.username}`),
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
