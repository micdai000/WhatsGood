import type { ProfileSearchParams, ProfileSortOrder } from "@/types";

export const PUBLIC_PROFILE_SELECT = `
  username,
  display_name,
  avatar,
  bio,
  city,
  state,
  created_at,
  profession_id,
  average_rating,
  total_reviews,
  current_badge_tier,
  current_badge_sub_tier,
  current_badge_period,
  professions ( name )
`;

/** Escape special characters for PostgREST ilike patterns */
export function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyProfileSearchFilters(query: any, params: ProfileSearchParams) {
  let next = query;

  if (params.completeOnly !== false) {
    next = next
      .not("profession_id", "is", null)
      .not("city", "is", null)
      .not("state", "is", null)
      .not("display_name", "is", null);
  }

  if (params.professionId) {
    next = next.eq("profession_id", params.professionId);
  }

  if (params.city) {
    next = next.ilike("city", `%${escapeIlikePattern(params.city)}%`);
  }

  if (params.state) {
    next = next.ilike("state", `%${escapeIlikePattern(params.state)}%`);
  }

  if (params.query) {
    const pattern = `%${escapeIlikePattern(params.query)}%`;
    next = next.or(`display_name.ilike.${pattern},username.ilike.${pattern}`);
  }

  return next;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyProfileSort(query: any, sort: ProfileSortOrder = "newest") {
  switch (sort) {
    case "rating":
      return query.order("average_rating", { ascending: false });
    case "reviews":
      return query.order("total_reviews", { ascending: false });
    case "name":
      return query.order("display_name", { ascending: true });
    case "newest":
    default:
      return query.order("created_at", { ascending: false });
  }
}
