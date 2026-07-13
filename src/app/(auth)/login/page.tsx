import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AlreadySignedInPanel } from "@/components/auth/already-signed-in-panel";
import { Spinner } from "@/components/ui/spinner";
import { useAuthContext } from "@/contexts/auth-context";
import { resolvePostAuthRedirect, getOnboardingStatus } from "@/lib/onboarding/routing";

export default function LoginPage() {
  const { user, loading } = useAuthContext();
  const [signedInState, setSignedInState] = useState<{
    continueHref: string;
    continueLabel: string;
  } | null>(null);
  const [checkingRedirect, setCheckingRedirect] = useState(false);

  useEffect(() => {
    if (loading || !user) {
      setSignedInState(null);
      return;
    }

    let cancelled = false;
    setCheckingRedirect(true);

    Promise.all([
      resolvePostAuthRedirect(user.id),
      getOnboardingStatus(user.id),
    ])
      .then(([continueHref, onboarding]) => {
        if (cancelled) return;
        const continueLabel =
          onboarding.ok && onboarding.status === "has_profile"
            ? "Continue to Dashboard"
            : "Continue setup";
        setSignedInState({ continueHref, continueLabel });
      })
      .finally(() => {
        if (!cancelled) setCheckingRedirect(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (loading || (user && checkingRedirect)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (user && signedInState) {
    return (
      <AlreadySignedInPanel
        email={user.email}
        continueHref={signedInState.continueHref}
        continueLabel={signedInState.continueLabel}
        mode="login"
      />
    );
  }

  return <LoginForm />;
}
