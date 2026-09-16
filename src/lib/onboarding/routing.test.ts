import { describe, expect, it } from "vitest";
import {
  resolveOnboardingRedirect,
  isOnboardingRoute,
  isDashboardRoute,
} from "@/lib/onboarding/constants";
import { resolvePostAuthPath } from "@/lib/onboarding/routing";

describe("business onboarding routing", () => {
  it("sends users without a business to business onboarding after auth", () => {
    expect(resolvePostAuthPath(false)).toBe("/onboarding/business");
  });

  it("sends users with a business to the dashboard after auth", () => {
    expect(resolvePostAuthPath(true)).toBe("/dashboard");
  });

  it("does not loop: onboarding with a business goes to dashboard", () => {
    expect(resolveOnboardingRedirect("/onboarding/business", true)).toBe(
      "/dashboard",
    );
  });

  it("does not loop: dashboard without a business goes to onboarding", () => {
    expect(resolveOnboardingRedirect("/dashboard", false)).toBe(
      "/onboarding/business",
    );
    expect(resolveOnboardingRedirect("/dashboard/qr", false)).toBe(
      "/onboarding/business",
    );
  });

  it("leaves onboarding users on the business setup route", () => {
    expect(resolveOnboardingRedirect("/onboarding/business", false)).toBeNull();
    expect(isOnboardingRoute("/onboarding/business")).toBe(true);
    expect(isDashboardRoute("/dashboard/profile")).toBe(true);
  });
});
