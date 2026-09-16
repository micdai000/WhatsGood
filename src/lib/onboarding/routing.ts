import { businessService } from "@/services/businesses/business.service";
import { isFailure, isSuccess } from "@/types";

export type OnboardingStatus = "no_business" | "has_business";

/** @deprecated Use OnboardingStatus. Legacy profile onboarding is no longer the gate. */
export type LegacyOnboardingStatus = "no_profile" | "has_profile";

/**
 * Determines whether the signed-in user already manages a business.
 */
export async function getOnboardingStatus(
  _userId?: string,
): Promise<
  | { ok: true; status: OnboardingStatus }
  | { ok: false; error: { code: string; message: string } }
> {
  const result = await businessService.getMyBusinesses();

  if (isSuccess(result)) {
    return {
      ok: true,
      status: result.data.length > 0 ? "has_business" : "no_business",
    };
  }

  if (isFailure(result)) {
    return {
      ok: false,
      error: {
        code: result.error.code,
        message: result.error.message,
      },
    };
  }

  return {
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Unable to check business status",
    },
  };
}

export function resolvePostAuthPath(hasBusiness: boolean): string {
  return hasBusiness ? "/dashboard" : "/onboarding/business";
}

export async function resolvePostAuthRedirect(_userId?: string): Promise<string> {
  const onboarding = await getOnboardingStatus(_userId);

  if (!onboarding.ok) {
    return "/onboarding/business";
  }

  return resolvePostAuthPath(onboarding.status === "has_business");
}
