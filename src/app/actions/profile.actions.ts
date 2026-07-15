import { authService } from "@/services/auth/auth.service";
import { profileService } from "@/services/profiles/profile.service";
import { createProfileSchema, validate } from "@/lib/validators";
import { ValidationError } from "@/lib/errors";
import type { UpdateProfileInput } from "@/types";
import { isFailure } from "@/types";

export type ProfileActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; message: string; code: string; fieldErrors?: Record<string, string[]> };

function toProfileActionError(
  error: { message: string; code: string; details?: unknown },
): ProfileActionResult<never> {
  const fieldErrors =
    error.details &&
    typeof error.details === "object" &&
    !Array.isArray(error.details)
      ? (error.details as Record<string, string[]>)
      : undefined;

  return {
    success: false,
    message: error.message,
    code: error.code,
    fieldErrors,
  };
}

export async function updateProfileAction(
  input: UpdateProfileInput,
): Promise<ProfileActionResult<{ username: string; previousUsername: string }>> {
  try {
    const sessionResult = await authService.getSession();

    if (isFailure(sessionResult) || !sessionResult.data) {
      return {
        success: false,
        message: "You must be signed in to update your profile.",
        code: "UNAUTHORIZED",
      };
    }

    const userId = sessionResult.data.user.id;
    const existingResult = await profileService.getProfile(userId);

    if (isFailure(existingResult)) {
      return toProfileActionError(existingResult.error);
    }

    const previousUsername = existingResult.data.username;
    const validated = validate(createProfileSchema, input);
    const result = await profileService.updateProfile(userId, validated);

    if (isFailure(result)) {
      return toProfileActionError(result.error);
    }




    return {
      success: true,
      data: {
        username: result.data.username,
        previousUsername,
      },
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return toProfileActionError({
        message: error.message,
        code: error.code,
        details: error.details,
      });
    }

    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      code: "INTERNAL_ERROR",
    };
  }
}

