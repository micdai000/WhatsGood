import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { ErrorState } from "@/components/layout/error-state";
import { Spinner } from "@/components/ui/spinner";
import { useAuthContext } from "@/contexts/auth-context";
import { ONBOARDING_ROUTES } from "@/lib/onboarding/constants";
import { getOnboardingStatus } from "@/lib/onboarding/routing";

export function RequireDashboard() {
  const { user, loading } = useAuthContext();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  function check() {
    if (!user) {
      setChecking(false);
      return;
    }

    setChecking(true);
    setStatusError(null);
    getOnboardingStatus(user.id).then((status) => {
      if (!status.ok) {
        setStatusError(status.error.message);
        setReady(false);
        setChecking(false);
        return;
      }
      setReady(status.status === "has_business");
      setChecking(false);
    });
  }

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    getOnboardingStatus(user.id).then((status) => {
      if (cancelled) return;
      if (!status.ok) {
        setStatusError(status.error.message);
        setReady(false);
        setChecking(false);
        return;
      }
      setReady(status.status === "has_business");
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

  if (statusError) {
    return (
      <ErrorState
        title="Unable to open your dashboard"
        description={statusError}
        onRetry={check}
      />
    );
  }

  if (!ready) {
    return <Navigate to={ONBOARDING_ROUTES.business} replace />;
  }

  return <Outlet />;
}
