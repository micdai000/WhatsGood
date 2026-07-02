import { describe, expect, it } from "vitest";
import { profileSearchSchema } from "@/lib/validators/profile-search";
import { buildSearchUrl, parseProfileSearchParams } from "@/lib/search/params";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("search validators and params", () => {
  it("parses query string params", () => {
    const params = parseProfileSearchParams({
      q: "  designer  ",
      profession: VALID_UUID,
      city: "Austin",
      sort: "rating",
      page: "2",
    });

    expect(params.query).toBe("designer");
    expect(params.professionId).toBe(VALID_UUID);
    expect(params.city).toBe("Austin");
    expect(params.sort).toBe("rating");
    expect(params.page).toBe(2);
  });

  it("applies defaults for empty search params", () => {
    const params = profileSearchSchema.parse({});
    expect(params.sort).toBe("newest");
    expect(params.page).toBe(1);
    expect(params.limit).toBe(12);
  });

  it("builds search URLs without empty params", () => {
    const url = buildSearchUrl("/search", {
      query: "coach",
      sort: "newest",
      page: 1,
      limit: 12,
      completeOnly: true,
    });

    expect(url).toBe("/search?q=coach");
  });
});
