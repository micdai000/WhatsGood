import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import {
  isExpiredAuthCallback,
  parseAuthCallbackParams,
  toEmailOtpType,
} from "@/lib/auth/callback-params";
import { sanitizeRedirectPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/client";
import { authService } from "@/services/auth/auth.service";
import { isFailure } from "@/types";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const params = parseAuthCallbackParams(
      window.location.search,
      window.location.hash,
    );
    const next = sanitizeRedirectPath(params.next, "/");

    async function handleCallback() {
      if (isExpiredAuthCallback(params)) {
        navigate("/login?error=EXPIRED_TOKEN", { replace: true });
        return;
      }

      if (params.tokenHash) {
        const result = await authService.verifyEmail(
          params.tokenHash,
          toEmailOtpType(params.type),
        );
        if (isFailure(result)) {
          navigate(`/login?error=${result.error.code}`, { replace: true });
          return;
        }
        navigate(next, { replace: true });
        return;
      }

      const supabase = createClient();

      if (params.code) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          const { error } = await supabase.auth.exchangeCodeForSession(
            params.code,
          );
          if (error) {
            navigate("/login?error=EXPIRED_TOKEN", { replace: true });
            return;
          }
        }
      } else if (params.accessToken && params.refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: params.accessToken,
          refresh_token: params.refreshToken,
        });

        if (error) {
          navigate("/login?error=EXPIRED_TOKEN", { replace: true });
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login", { replace: true });
        return;
      }

      const type = params.type ?? searchParams.get("type");

      if (type === "recovery") {
        navigate("/reset-password", { replace: true });
        return;
      }

      navigate(next, { replace: true });
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
