import { DEFAULTS } from "@/lib/constants";
import type { PublicProfile } from "@/types";

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
    memberSince: row.created_at,
    isComplete: isPublicProfileComplete(row),
  };
}
