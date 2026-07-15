import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useAuthContext } from "@/contexts/auth-context";
import { ONBOARDING_ROUTES } from "@/lib/onboarding/constants";
import { getOnboardingStatus } from "@/lib/onboarding/routing";
import { isSuccess } from "@/types";

export function RequireOnboarding() {
  const { user, loading } = useAuthContext();
  const [checking, setChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    getOnboardingStatus(user.id).then((status) => {
      if (cancelled) return;
      setHasProfile(status.ok && status.status === "has_profile");
      setChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading || checking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (hasProfile) {
    return <Navigate to={ONBOARDING_ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}
