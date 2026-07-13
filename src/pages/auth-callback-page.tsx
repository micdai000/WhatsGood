import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { sanitizeRedirectPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/client";
import { authService } from "@/services/auth/auth.service";
import { isFailure } from "@/types";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = sanitizeRedirectPath(searchParams.get("next"), "/login");

    async function handleCallback() {
      if (tokenHash && type === "email") {
        const result = await authService.verifyEmail(tokenHash);
        if (isFailure(result)) {
          navigate(`/login?error=${result.error.code}`, { replace: true });
          return;
        }
        navigate("/login?verified=true", { replace: true });
        return;
      }

      if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          navigate("/login?error=EXPIRED_TOKEN", { replace: true });
          return;
        }

        if (type === "recovery") {
          navigate("/reset-password", { replace: true });
          return;
        }

        await supabase.auth.signOut();
        if (type === "signup") {
          navigate("/login?verified=true", { replace: true });
          return;
        }
        navigate(next, { replace: true });
        return;
      }

      navigate("/login", { replace: true });
    }

    void handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function LegacyAuthRedirect({ to }: { to: string }) {
  return <Navigate to={to} replace />;
}
