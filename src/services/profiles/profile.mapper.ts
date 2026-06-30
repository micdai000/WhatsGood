import type { Profile } from "@/types";

export type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  bio: string | null;
  profession_id: string | null;
  city: string | null;
  state: string | null;
  followers_count: number;
  following_count: number;
  total_votes_cast: number;
  entities_followed_count: number;
  libraries_created_count: number;
  created_at: string;
  updated_at: string;
};

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
    followersCount: row.followers_count,
    followingCount: row.following_count,
    totalVotesCast: row.total_votes_cast,
    entitiesFollowedCount: row.entities_followed_count,
    librariesCreatedCount: row.libraries_created_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
