import type { Profile, SocialLinks } from "@/types";
import { DEFAULT_SOCIAL_LINKS } from "@/types/profile";

export type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  bio: string | null;
  profession_id: string | null;
  city: string | null;
  state: string | null;
  social_links?: SocialLinks | Record<string, unknown> | null;
  followers_count: number;
  following_count: number;
  total_votes_cast: number;
  entities_followed_count: number;
  libraries_created_count: number;
  created_at: string;
  updated_at: string;
};

/** Normalize DB JSONB (including `{}` / null / partial objects) into SocialLinks. */
export function normalizeSocialLinks(value: unknown): SocialLinks {
  const raw =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const links: SocialLinks = { ...DEFAULT_SOCIAL_LINKS };

  for (const [key, entry] of Object.entries(raw)) {
    if (typeof entry === "string") {
      links[key] = entry;
    }
  }

  return links;
}

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar,
    bio: row.bio,
    professionId: row.profession_id,
    city: row.city,
    state: row.state,
    socialLinks: normalizeSocialLinks(row.social_links),
    followersCount: row.followers_count,
    followingCount: row.following_count,
    totalVotesCast: row.total_votes_cast,
    entitiesFollowedCount: row.entities_followed_count,
    librariesCreatedCount: row.libraries_created_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
