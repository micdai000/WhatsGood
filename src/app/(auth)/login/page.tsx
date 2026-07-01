import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AlreadySignedInPanel } from "@/components/auth/already-signed-in-panel";
import { LoadingState } from "@/components/layout/loading-state";
import { authService } from "@/services/auth/auth.service";
import { resolvePostAuthRedirect, getOnboardingStatus } from "@/lib/onboarding/routing";
import { isSuccess } from "@/types";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const sessionResult = await authService.getSession();

  if (isSuccess(sessionResult) && sessionResult.data) {
    const userId = sessionResult.data.user.id;
    const [continueHref, onboarding] = await Promise.all([
      resolvePostAuthRedirect(userId),
      getOnboardingStatus(userId),
    ]);
    const continueLabel =
      onboarding.ok && onboarding.status === "has_profile"
        ? "Continue to Dashboard"
        : "Continue setup";

    return (
      <AlreadySignedInPanel
        email={sessionResult.data.user.email}
        continueHref={continueHref}
        continueLabel={continueLabel}
        mode="login"
      />
    );
  }

  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <LoginForm />
    </Suspense>
  );
}
