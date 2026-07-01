import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileView } from "@/components/profile/public-profile-view";
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

  return {
    title: `${displayName} | TrustLoop`,
    description,
    openGraph: {
      title: `${displayName} | TrustLoop`,
      description,
      type: "profile",
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

  return <PublicProfileView profile={result.data} />;
}
