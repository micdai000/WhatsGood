"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { authService } from "@/services/auth/auth.service";
import { profileService } from "@/services/profiles/profile.service";
import { ValidationError } from "@/lib/errors";
import {
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
  validate,
} from "@/lib/validators";
import { resolvePostAuthRedirect } from "@/lib/onboarding/routing";
import { isFailure } from "@/types";

export type AuthActionState = {
  success: boolean;
  message?: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
};

function toActionState(
  error: { message: string; code: string; details?: unknown },
): AuthActionState {
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

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    const input = validate(signUpSchema, {
      email: formData.get("email"),
      password: formData.get("password"),
      fullName: formData.get("fullName"),
    });

    const result = await authService.signUp(input);

    if (isFailure(result)) {
      return toActionState(result.error);
    }

    return {
      success: true,
      message:
        "Account created. Check your email to verify your address before signing in.",
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return toActionState({
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

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    const input = validate(signInSchema, {
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const result = await authService.signIn(input);

    if (isFailure(result)) {
      return toActionState(result.error);
    }

    revalidatePath("/", "layout");

    const postAuthRedirect = await resolvePostAuthRedirect(result.data.user.id);
    const requestedRedirect = formData.get("redirect")?.toString();
    const destination = requestedRedirect
      ? getSafeRedirectPath(requestedRedirect, postAuthRedirect)
      : postAuthRedirect;

    redirect(destination);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    if (error instanceof ValidationError) {
      return toActionState({
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

export async function signOutAction(): Promise<void> {
  const result = await authService.signOut();
  revalidatePath("/", "layout");
  if (isFailure(result)) {
    redirect("/login?error=SIGN_OUT_FAILED");
  }
  redirect("/login");
}

export async function signOutToSignupAction(): Promise<void> {
  const result = await authService.signOut();
  revalidatePath("/", "layout");
  if (isFailure(result)) {
    redirect("/signup?error=SIGN_OUT_FAILED");
  }
  redirect("/signup");
}

export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    const input = validate(resetPasswordSchema, {
      email: formData.get("email"),
    });

    const result = await authService.resetPassword(input);

    if (isFailure(result)) {
      return toActionState(result.error);
    }

    return {
      success: true,
      message: "If an account exists for that email, a reset link has been sent.",
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return toActionState({
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

export async function updatePasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    const input = validate(updatePasswordSchema, {
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const result = await authService.updatePassword({
      password: input.password,
    });

    if (isFailure(result)) {
      return toActionState(result.error);
    }

    return {
      success: true,
      message: "Password updated. You can now sign in with your new password.",
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return toActionState({
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

export async function deleteAccountAction(): Promise<void> {
  const sessionResult = await authService.getSession();

  if (isFailure(sessionResult) || !sessionResult.data) {
    redirect("/login");
  }

  await profileService.deleteUserAvatars(sessionResult.data.user.id);

  const result = await authService.deleteAccount();
  revalidatePath("/", "layout");
  if (isFailure(result)) {
    redirect("/dashboard/settings?error=DELETE_ACCOUNT_FAILED");
  }
  redirect("/login?deleted=1");
}

export async function getSessionAction() {
  return authService.getSession();
}

export async function getCurrentUserAction() {
  return authService.getCurrentUser();
}

export async function refreshSessionAction() {
  return authService.refreshSession();
}
