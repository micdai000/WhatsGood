"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkOnboardingStatusAction } from "@/app/actions/onboarding.actions";
import { WelcomeContent } from "@/components/onboarding/welcome-content";
import { LoadingState } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import { EmptyState } from "@/components/layout/empty-state";
import { ONBOARDING_ROUTES } from "@/lib/onboarding/constants";
import { UserRound } from "lucide-react";

export function WelcomePageClient() {
  const router = useRouter();
  const [state, setState] = useState<
    Awaited<ReturnType<typeof checkOnboardingStatusAction>> | "loading"
  >("loading");

  useEffect(() => {
    let active = true;

    checkOnboardingStatusAction().then((result) => {
      if (!active) return;
      setState(result);
    });

    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") {
    return <LoadingState label="Checking profile…" fullPage />;
  }

  if (state.status === "error") {
    return (
      <ErrorState
        title="Unable to check your profile"
        description={state.message}
        onRetry={() => {
          setState("loading");
          checkOnboardingStatusAction().then(setState);
        }}
        className="mx-auto max-w-lg"
      />
    );
  }

  if (state.status === "has_profile") {
    router.replace(ONBOARDING_ROUTES.dashboard);
    return <LoadingState label="Redirecting to your dashboard…" fullPage />;
  }

  return <WelcomeContent />;
}
