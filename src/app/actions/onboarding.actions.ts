import { authService } from "@/services/auth/auth.service";
import { profileService } from "@/services/profiles/profile.service";
import { professionService } from "@/services/professions/profession.service";
import {
  getOnboardingStatus,
  resolvePostAuthRedirect,
} from "@/lib/onboarding/routing";
import { ONBOARDING_ROUTES } from "@/lib/onboarding/constants";
import type { CreateProfileInput, Profession } from "@/types";
import { isFailure, isSuccess } from "@/types";
import { toSerializableActionResult } from "@/lib/actions/serializable-result";
import type { SerializableActionResult } from "@/lib/actions/serializable-result";

export type OnboardingCheckState =
  | { status: "loading" }
  | { status: "no_profile" }
  | { status: "has_profile" }
  | { status: "error"; message: string; code: string };

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; message: string; code: string };

export async function checkOnboardingStatusAction(): Promise<OnboardingCheckState> {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    return {
      status: "error",
      message: "You must be signed in to continue.",
      code: "UNAUTHORIZED",
    };
  }

  const onboarding = await getOnboardingStatus(sessionResult.data.user.id);

  if (!onboarding.ok) {
    return {
      status: "error",
      message: onboarding.error.message,
      code: onboarding.error.code,
    };
  }

  return {
    status: onboarding.status === "has_profile" ? "has_profile" : "no_profile",
  };
}

export async function redirectAfterAuthAction(): Promise<string> {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    return "/login";
  }

  return resolvePostAuthRedirect(sessionResult.data.user.id);
}

export async function getProfessionsAction(): Promise<
  SerializableActionResult<Profession[]>
> {
  const result = await professionService.getProfessions();
  return toSerializableActionResult(result);
}

export async function checkSlugAvailabilityAction(
  slug: string,
): Promise<ActionResult<{ available: boolean }>> {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    return {
      success: false,
      message: "You must be signed in to continue.",
      code: "UNAUTHORIZED",
    };
  }

  const result = await profileService.checkSlugAvailability(
    slug,
    sessionResult.data.user.id,
  );

  if (isFailure(result)) {
    return {
      success: false,
      message: result.error.message,
      code: result.error.code,
    };
  }

  return { success: true, data: result.data };
}

export async function uploadProfilePhotoAction(
  formData: FormData,
): Promise<ActionResult<{ url: string; path: string }>> {
  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    return {
      success: false,
      message: "Please choose a photo to upload.",
      code: "VALIDATION_ERROR",
    };
  }

  const result = await profileService.uploadProfilePhoto(file);

  if (isFailure(result)) {
    return {
      success: false,
      message: result.error.message,
      code: result.error.code,
    };
  }

  return { success: true, data: result.data };
}

export async function createProfileAction(
  input: CreateProfileInput,
): Promise<ActionResult<{ username: string }>> {
  const result = await profileService.createProfile(input);

  if (isFailure(result)) {
    return {
      success: false,
      message: result.error.message,
      code: result.error.code,
    };
  }

  return { success: true, data: { username: result.data.username } };
}

export async function completeOnboardingAction(): Promise<string> {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    return "/login";
  }

  const onboarding = await getOnboardingStatus(sessionResult.data.user.id);

  if (!onboarding.ok || onboarding.status !== "has_profile") {
    return ONBOARDING_ROUTES.welcome;
  }

  return ONBOARDING_ROUTES.dashboard;
}
