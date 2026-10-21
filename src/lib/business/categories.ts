/** Keep Other last so category dropdowns stay alphabetical with a catch-all at the end. */

export const OTHER_CATEGORY_SLUG = "other";

export function isOtherCategory(category: {
  slug?: string | null;
  name?: string | null;
}): boolean {
  return (
    category.slug === OTHER_CATEGORY_SLUG ||
    category.name?.trim().toLowerCase() === "other"
  );
}

export function sortCategoriesForSelect<T extends { name: string; slug: string }>(
  categories: T[],
): T[] {
  const rest: T[] = [];
  const other: T[] = [];

  for (const category of categories) {
    if (isOtherCategory(category)) {
      other.push(category);
    } else {
      rest.push(category);
    }
  }

  rest.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  return [...rest, ...other];
}

export function displayCategoryName(
  category: { name: string; slug?: string | null } | null | undefined,
  customCategory?: string | null,
): string | null {
  const custom = customCategory?.trim();
  if (category && isOtherCategory(category) && custom) {
    return custom;
  }
  return category?.name ?? (custom || null);
}

export function normalizeCustomCategory(
  category: { slug?: string | null; name?: string | null } | null | undefined,
  value: string | null | undefined,
): string | null {
  if (!category || !isOtherCategory(category)) {
    return null;
  }
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}
