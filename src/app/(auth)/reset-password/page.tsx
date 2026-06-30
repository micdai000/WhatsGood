import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { LoadingState } from "@/components/layout/loading-state";
import { authService } from "@/services/auth/auth.service";
import { isSuccess } from "@/types";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const sessionResult = await authService.getSession();
  const hasRecoverySession =
    isSuccess(sessionResult) && sessionResult.data !== null;

  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <ResetPasswordForm hasRecoverySession={hasRecoverySession} />
    </Suspense>
  );
}
