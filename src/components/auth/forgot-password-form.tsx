"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  resetPasswordAction,
  type AuthActionState,
} from "@/app/actions/auth.actions";
import { AuthCard } from "@/components/auth/auth-card";
import {
  AuthFormError,
  AuthFormSuccess,
} from "@/components/auth/auth-form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Muted } from "@/components/typography/typography";

const initialState: AuthActionState = { success: false };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <AuthCard
      title="Reset your password"
      description="We'll email you a link to choose a new password"
    >
      {state.success ? (
        <AuthFormSuccess message={state.message} />
      ) : (
        <AuthFormError message={state.message} code={state.code} />
      )}

      {!state.success ? (
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
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
