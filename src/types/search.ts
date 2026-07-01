import type { PaginationParams } from "./pagination";
import type { PublicProfile } from "./profile";

export const PROFILE_SORT_ORDERS = [
  "newest",
  "rating",
  "reviews",
  "name",
] as const;

export type ProfileSortOrder = (typeof PROFILE_SORT_ORDERS)[number];

export interface ProfileSearchParams extends PaginationParams {
  query?: string;
  professionId?: string;
  city?: string;
  state?: string;
  sort?: ProfileSortOrder;
  /** When true (default), only return onboarding-complete profiles */
  completeOnly?: boolean;
}

export type ProfileSearchResult = PublicProfile;
