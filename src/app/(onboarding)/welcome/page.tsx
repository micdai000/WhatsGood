import { redirect } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import { getOnboardingStatus } from "@/lib/onboarding/routing";
import { ONBOARDING_ROUTES } from "@/lib/onboarding/constants";
import { isSuccess } from "@/types";
import { WelcomePageClient } from "@/components/onboarding/welcome-page-client";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const sessionResult = await authService.getSession();

  if (!isSuccess(sessionResult) || !sessionResult.data) {
    redirect("/login");
  }

  const onboarding = await getOnboardingStatus(sessionResult.data.user.id);

  if (onboarding.ok && onboarding.status === "has_profile") {
    redirect(ONBOARDING_ROUTES.dashboard);
  }

  return <WelcomePageClient />;
}
