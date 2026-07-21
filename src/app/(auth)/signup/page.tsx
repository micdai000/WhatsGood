import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SignUpForm } from "@/components/auth/signup-form";
import { Spinner } from "@/components/ui/spinner";
import { useAuthContext } from "@/contexts/auth-context";
import { ONBOARDING_ROUTES } from "@/lib/onboarding/constants";
import { getOnboardingStatus } from "@/lib/onboarding/routing";

export default function SignUpPage() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    let cancelled = false;

    getOnboardingStatus(user.id).then((status) => {
      if (cancelled || !status.ok) {
        return;
      }

      navigate(
        status.status === "has_profile" ? "/" : ONBOARDING_ROUTES.welcome,
        { replace: true },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [user, loading, navigate]);

  if (loading || user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <SignUpForm />;
}
