import type { BadgeSubTier, BadgeTier } from "./badge";

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  professionId: string | null;
  city: string | null;
  state: string | null;
  followersCount: number;
  followingCount: number;
  totalVotesCast: number;
  entitiesFollowedCount: number;
  librariesCreatedCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Public-facing profile data — no internal IDs or private metrics */
export interface PublicProfile {
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  professionName: string | null;
  city: string | null;
  state: string | null;
  averageRating: number;
  totalReviews: number;
  badgeTier: BadgeTier;
  badgeSubTier: BadgeSubTier | null;
  badgePeriod: string | null;
  memberSince: string;
  isComplete: boolean;
}

export interface CreateProfileInput {
  slug: string;
  fullName: string;
  professionId: string;
  bio?: string | null;
  city: string;
  state: string;
  profilePhoto?: string | null;
}

/** Partial profile updates for editing */
export interface UpdateProfileInput {
  slug?: string;
  fullName?: string;
  professionId?: string | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  profilePhoto?: string | null;
}
