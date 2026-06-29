const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''\u2019]/g, "")
    .replace(/[&]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: "Slug cannot be empty" };
  }

  if (slug.length > 200) {
    return { valid: false, error: "Slug must be 200 characters or fewer" };
  }

  if (!SLUG_PATTERN.test(slug)) {
    return {
      valid: false,
      error:
        "Slug must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen",
    };
  }

  return { valid: true };
}

const CATEGORY_ROUTE_MAP: Record<string, string> = {
  food: "food",
  place: "place",
  movie_show: "movie-show",
  entertainment: "entertainment",
};

const ROUTE_CATEGORY_MAP: Record<string, string> = {
  food: "food",
  place: "place",
  "movie-show": "movie_show",
  entertainment: "entertainment",
};

export function categoryToRouteSegment(category: string): string {
  return CATEGORY_ROUTE_MAP[category] ?? category;
}

export function routeSegmentToCategory(segment: string): string {
  return ROUTE_CATEGORY_MAP[segment] ?? segment;
}

export function getEntityPath(category: string, slug: string): string {
  return `/${categoryToRouteSegment(category)}/${slug}`;
}
