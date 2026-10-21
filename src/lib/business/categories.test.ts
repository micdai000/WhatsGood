import { describe, expect, it } from "vitest";
import {
  displayCategoryName,
  isOtherCategory,
  normalizeCustomCategory,
  sortCategoriesForSelect,
} from "./categories";

describe("sortCategoriesForSelect", () => {
  it("sorts alphabetically and keeps Other last", () => {
    const sorted = sortCategoriesForSelect([
      { name: "Other", slug: "other" },
      { name: "Hotel", slug: "hotel" },
      { name: "Barber", slug: "barber" },
      { name: "Automotive", slug: "automotive" },
    ]);

    expect(sorted.map((category) => category.name)).toEqual([
      "Automotive",
      "Barber",
      "Hotel",
      "Other",
    ]);
  });
});

describe("displayCategoryName", () => {
  it("uses the typed category when Other is selected", () => {
    expect(
      displayCategoryName({ name: "Other", slug: "other" }, "Pet sitting"),
    ).toBe("Pet sitting");
  });

  it("falls back to Other when no custom value is set", () => {
    expect(displayCategoryName({ name: "Other", slug: "other" }, "  ")).toBe(
      "Other",
    );
  });
});

describe("normalizeCustomCategory", () => {
  it("stores a custom value only for Other", () => {
    expect(
      normalizeCustomCategory({ name: "Hotel", slug: "hotel" }, "Lodge"),
    ).toBeNull();
    expect(
      normalizeCustomCategory({ name: "Other", slug: "other" }, "  Florist  "),
    ).toBe("Florist");
  });
});

describe("isOtherCategory", () => {
  it("matches Other by slug or name", () => {
    expect(isOtherCategory({ slug: "other", name: "Other" })).toBe(true);
    expect(isOtherCategory({ slug: "misc", name: "Other" })).toBe(true);
    expect(isOtherCategory({ slug: "hotel", name: "Hotel" })).toBe(false);
  });
});
