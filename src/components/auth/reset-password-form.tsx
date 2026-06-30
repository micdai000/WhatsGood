"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  updatePasswordAction,
  type AuthActionState,
} from "@/app/actions/auth.actions";
import { AuthCard } from "@/components/auth/auth-card";
import {
  AuthFormError,
  AuthFormSuccess,
} from "@/components/auth/auth-form-feedback";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Muted } from "@/components/typography/typography";
import { useState } from "react";

const initialState: AuthActionState = { success: false };

export function ResetPasswordForm({
  hasRecoverySession = false,
}: {
  hasRecoverySession?: boolean;
}) {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  const expiredFromQuery = searchParams.get("error") === "EXPIRED_TOKEN";
  const canReset = hasRecoverySession && !expiredFromQuery;

  return (
    <AuthCard
      title="Choose a new password"
      description="Enter a strong password for your account"
    >
      {!canReset ? (
        <AuthFormError
          message="This reset link has expired. Request a new one."
          code="EXPIRED_TOKEN"
        />
      ) : null}

      {state.success ? (
        <AuthFormSuccess message={state.message} />
      ) : (
        <AuthFormError message={state.message} code={state.code} />
      )}

      {canReset && !state.success ? (
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <PasswordInput
              id="password"
              name="password"
              label="New password"
              autoComplete="new-password"
              required
              onPasswordChange={setPassword}
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
      ) : null}

      <Muted className="mt-6 text-center">
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Back to sign in
        </Link>
      </Muted>
    </AuthCard>
  );
}
