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

export interface CreateProfileInput {
  slug: string;
  fullName: string;
  professionId: string;
  bio?: string | null;
  city: string;
  state: string;
  profilePhoto?: string | null;
}

/** Profile editing is not implemented yet */
export interface UpdateProfileInput {
  slug?: string;
  fullName?: string;
  professionId?: string | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  profilePhoto?: string | null;
}
