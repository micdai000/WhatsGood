import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";

describe("getSafeRedirectPath", () => {
  it("allows same-origin relative paths", () => {
    expect(getSafeRedirectPath("/dashboard/reviews")).toBe("/dashboard/reviews");
  });

  it("rejects external URLs", () => {
    expect(getSafeRedirectPath("https://evil.example/phish")).toBe("/dashboard");
  });

  it("rejects protocol-relative URLs", () => {
    expect(getSafeRedirectPath("//evil.example/phish")).toBe("/dashboard");
  });

  it("rejects auth loop redirects", () => {
    expect(getSafeRedirectPath("/login?x=1")).toBe("/dashboard");
  });

  it("uses custom fallback", () => {
    expect(getSafeRedirectPath(null, "/onboarding/welcome")).toBe(
      "/onboarding/welcome",
    );
  });
});
