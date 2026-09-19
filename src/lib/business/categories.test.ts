import { describe, expect, it } from "vitest";
import { sortCategoriesForSelect } from "./categories";

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
