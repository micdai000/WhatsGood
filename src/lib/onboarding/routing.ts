import { profileService } from "@/services/profiles/profile.service";
import { isFailure, isSuccess } from "@/types";
import { ONBOARDING_ROUTES } from "./constants";

export type OnboardingStatus = "no_profile" | "has_profile";

/**
 * Determines onboarding status via ProfileService (server actions / layouts).
 */
export async function getOnboardingStatus(
  userId: string,
): Promise<
  | { ok: true; status: OnboardingStatus }
  | { ok: false; error: { code: string; message: string } }
> {
  const result = await profileService.getProfile(userId);

  if (isSuccess(result)) {
    return { ok: true, status: "has_profile" };
  }

  if (isFailure(result)) {
    if (result.error.code === "NOT_FOUND") {
      return { ok: true, status: "no_profile" };
    }

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
      message: "Unable to check profile status",
    },
  };
}

export async function resolvePostAuthRedirect(userId: string): Promise<string> {
  const status = await getOnboardingStatus(userId);

  if (!status.ok) {
    return ONBOARDING_ROUTES.welcome;
  }

  return status.status === "has_profile"
    ? ONBOARDING_ROUTES.dashboard
    : ONBOARDING_ROUTES.welcome;
}
