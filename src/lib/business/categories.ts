/** Keep Other last so category dropdowns stay alphabetical with a catch-all at the end. */
export function sortCategoriesForSelect<T extends { name: string; slug: string }>(
  categories: T[],
): T[] {
  return [...categories].sort((a, b) => {
    const aOther = a.slug === "other";
    const bOther = b.slug === "other";
    if (aOther !== bOther) {
      return aOther ? 1 : -1;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}
