import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Spinner } from "@/components/ui/spinner";
import { useAuthContext } from "@/contexts/auth-context";

export default function ResetPasswordPage() {
  const { session, loading } = useAuthContext();
  const hasRecoverySession = session !== null;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <ResetPasswordForm hasRecoverySession={hasRecoverySession} />;
}
