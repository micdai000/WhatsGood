import { describe, expect, it } from "vitest";
import { escapeIlikePattern } from "@/services/profiles/profile-search.query";

describe("escapeIlikePattern", () => {
  it("escapes ilike wildcards", () => {
    expect(escapeIlikePattern("100%_done\\")).toBe("100\\%\\_done\\\\");
  });
});
