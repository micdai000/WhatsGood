import { SignUpForm } from "@/components/auth/signup-form";
import { AlreadySignedInPanel } from "@/components/auth/already-signed-in-panel";
import { authService } from "@/services/auth/auth.service";
import { resolvePostAuthRedirect, getOnboardingStatus } from "@/lib/onboarding/routing";
import { isSuccess } from "@/types";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
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
        mode="signup"
      />
    );
  }

  return <SignUpForm />;
}
