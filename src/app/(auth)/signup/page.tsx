import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignUpForm } from "@/components/auth/signup-form";
import { Spinner } from "@/components/ui/spinner";
import { useAuthContext } from "@/contexts/auth-context";
import { resolvePostAuthRedirect } from "@/lib/onboarding/routing";

export default function SignUpPage() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  const [checkingRedirect, setCheckingRedirect] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    let cancelled = false;
    setCheckingRedirect(true);

    resolvePostAuthRedirect(user.id).then((href) => {
      if (!cancelled) {
        navigate(href, { replace: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, loading, navigate]);

  if (loading || checkingRedirect) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <SignUpForm />;
}
