import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { WelcomePageClient } from "@/components/onboarding/welcome-page-client";
import { Spinner } from "@/components/ui/spinner";
import { useAuthContext } from "@/contexts/auth-context";
import { getOnboardingStatus } from "@/lib/onboarding/routing";
import { ONBOARDING_ROUTES } from "@/lib/onboarding/constants";

export default function WelcomePage() {
  const { user, loading } = useAuthContext();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setRedirectTo("/login");
      return;
    }

    let cancelled = false;
    setCheckingOnboarding(true);

    getOnboardingStatus(user.id)
      .then((onboarding) => {
        if (cancelled) return;
        if (onboarding.ok && onboarding.status === "has_profile") {
          setRedirectTo(ONBOARDING_ROUTES.dashboard);
        }
      })
      .finally(() => {
        if (!cancelled) setCheckingOnboarding(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (loading || checkingOnboarding) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return <WelcomePageClient />;
}
