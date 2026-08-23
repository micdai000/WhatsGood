import { describe, expect, it } from "vitest";
import { CANONICAL_SITE_URL, resolveSiteUrl } from "@/lib/public-env";

describe("resolveSiteUrl", () => {
  it("uses the live origin when env is still localhost", () => {
    expect(
      resolveSiteUrl({
        configuredUrl: "http://localhost:3000",
        browserOrigin: "https://themeritt.com",
      }),
    ).toBe("https://themeritt.com");
  });

  it("uses the live origin when no site URL is configured", () => {
    expect(
      resolveSiteUrl({
        browserOrigin: "https://www.themeritt.com",
      }),
    ).toBe("https://www.themeritt.com");
  });

  it("keeps a configured production URL even on localhost", () => {
    expect(
      resolveSiteUrl({
        configuredUrl: "https://themeritt.com/",
        browserOrigin: "http://localhost:3000",
      }),
    ).toBe("https://themeritt.com");
  });

  it("uses the canonical site URL instead of advertising localhost", () => {
    expect(
      resolveSiteUrl({
        configuredUrl: "http://localhost:3000",
        browserOrigin: "http://localhost:3000",
        canonicalUrl: CANONICAL_SITE_URL,
      }),
    ).toBe(CANONICAL_SITE_URL);
  });

  it("falls back to localhost when nothing else is available", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
  });
});
