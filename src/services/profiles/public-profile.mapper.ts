import type { BadgeTier } from "@/types/badge";
import type { Profile, PublicProfile } from "@/types";
import { DEFAULTS } from "@/lib/constants";

export type PublicProfileRow = {
  username: string;
  display_name: string;
  avatar: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  profession_id: string | null;
  average_rating: number | string | null;
  total_reviews: number | null;
  current_badge_tier: BadgeTier | null;
  current_badge_period: string | null;
  professions: { name: string } | { name: string }[] | null;
};

function resolveProfessionName(
  professions: PublicProfileRow["professions"],
): string | null {
  if (!professions) return null;
  if (Array.isArray(professions)) {
    return professions[0]?.name ?? null;
  }
  return professions.name;
}

export function isPublicProfileComplete(row: PublicProfileRow): boolean {
  const professionName = resolveProfessionName(row.professions);
  return Boolean(
    row.display_name?.trim() &&
      professionName &&
      row.city?.trim() &&
      row.state?.trim(),
  );
}

export function mapPublicProfileRow(row: PublicProfileRow): PublicProfile {
  const professionName = resolveProfessionName(row.professions);

  return {
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar,
    bio: row.bio,
    professionName,
    city: row.city,
    state: row.state,
    averageRating: Number(row.average_rating ?? DEFAULTS.AVERAGE_RATING),
    totalReviews: row.total_reviews ?? DEFAULTS.TOTAL_REVIEWS,
    badgeTier: row.current_badge_tier ?? "none",
    badgePeriod: row.current_badge_period ?? null,
    memberSince: row.created_at,
    isComplete: isPublicProfileComplete(row),
  };
}

export function mapProfileToPublicProfile(
  profile: Profile,
  options: {
    professionName: string | null;
    averageRating?: number;
    totalReviews?: number;
    badgeTier?: BadgeTier;
    badgePeriod?: string | null;
  },
): PublicProfile {
  const professionName = options.professionName;

  return {
    username: profile.username,
    displayName: profile.displayName,
    avatar: profile.avatar,
    bio: profile.bio,
    professionName,
    city: profile.city,
    state: profile.state,
    averageRating: options.averageRating ?? DEFAULTS.AVERAGE_RATING,
    totalReviews: options.totalReviews ?? DEFAULTS.TOTAL_REVIEWS,
    badgeTier: options.badgeTier ?? "none",
    badgePeriod: options.badgePeriod ?? null,
    memberSince: profile.createdAt,
    isComplete: Boolean(
      profile.displayName?.trim() &&
        professionName &&
        profile.city?.trim() &&
        profile.state?.trim(),
    ),
  };
}
