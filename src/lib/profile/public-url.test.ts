import { describe, expect, it } from "vitest";
import {
  getPublicProfilePath,
  getPublicProfileUrl,
  resolveInAppProfileBackPath,
} from "@/lib/profile/public-url";

describe("public profile URLs", () => {
  it("builds profile paths with username slug", () => {
    expect(getPublicProfilePath("michael-davila")).toBe("/u/michael-davila");
  });

  it("falls back when username is empty", () => {
    expect(getPublicProfilePath("")).toBe("/search");
    expect(getPublicProfilePath("   ")).toBe("/search");
  });

  it("resolves absolute URLs to pathname only (ignores localhost vs prod host)", () => {
    expect(
      resolveInAppProfileBackPath(
        "https://meritt.example/u/jane-doe",
        "fallback",
      ),
    ).toBe("/u/jane-doe");
    expect(
      resolveInAppProfileBackPath(
        "http://localhost:3000/u/michael-davila",
        "fallback",
      ),
    ).toBe("/u/michael-davila");
  });

  it("fixes bare /u/ paths using fallback username", () => {
    expect(resolveInAppProfileBackPath("/u/", "michael-davila")).toBe(
      "/u/michael-davila",
    );
    expect(
      resolveInAppProfileBackPath("http://localhost:3000/u/", "michael-davila"),
    ).toBe("/u/michael-davila");
  });

  it("keeps relative paths unchanged", () => {
    expect(resolveInAppProfileBackPath("/u/alice")).toBe("/u/alice");
  });
});

describe("getPublicProfileUrl", () => {
  it("prefixes path with site URL", () => {
    const url = getPublicProfileUrl("bob");
    expect(url).toMatch(/\/u\/bob$/);
  });
});
