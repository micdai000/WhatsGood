"use server";

import { redirect } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import {
  getOnboardingStatus,
  resolvePostAuthRedirect,
} from "@/lib/onboarding/routing";
import { isSuccess } from "@/types";

export type OnboardingCheckState =
  | { status: "loading" }
  | { status: "no_profile" }
  | { status: "has_profile" }
  | { status: "error"; message: string; code: string };

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

export async function redirectAfterAuthAction(): Promise<never> {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    redirect("/login");
  }

  const path = await resolvePostAuthRedirect(sessionResult.data.user.id);
  redirect(path);
}
