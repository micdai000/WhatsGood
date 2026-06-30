export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  totalVotesCast: number;
  entitiesFollowedCount: number;
  librariesCreatedCount: number;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated Profile creation is not implemented yet — reserved for Phase 5 */
export interface CreateProfileInput {
  username: string;
  displayName: string;
  avatar?: string | null;
  bio?: string | null;
}

/** @deprecated Profile editing is not implemented yet */
export interface UpdateProfileInput {
  username?: string;
  displayName?: string;
  avatar?: string | null;
  bio?: string | null;
}
