"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUpAction, type AuthActionState } from "@/app/actions/auth.actions";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthDivider } from "@/components/auth/auth-divider";
import {
  AuthFormError,
  AuthFormSuccess,
} from "@/components/auth/auth-form-feedback";
import { OAuthButton } from "@/components/auth/oauth-button";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Muted } from "@/components/typography/typography";

const initialState: AuthActionState = { success: false };
const FORM_ERROR_ID = "signup-form-error";

export function SignUpForm() {
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  const describedBy = state.message ? FORM_ERROR_ID : undefined;

  return (
    <AuthCard
      title="Create your account"
      description="Start building trust with verified reviews"
    >
      {state.success ? (
        <AuthFormSuccess message={state.message} />
      ) : (
        <AuthFormError
          id={FORM_ERROR_ID}
          message={state.message}
          code={state.code}
        />
      )}

      {!state.success ? (
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              required
              placeholder="Jane Smith"
              aria-invalid={Boolean(state.fieldErrors?.fullName)}
              aria-describedby={describedBy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              aria-invalid={Boolean(state.fieldErrors?.email)}
              aria-describedby={describedBy}
            />
          </div>

          <div className="space-y-2">
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              autoComplete="new-password"
              required
              onPasswordChange={setPassword}
              aria-invalid={Boolean(state.fieldErrors?.password)}
              aria-describedby={describedBy}
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      ) : null}

      <AuthDivider />
      <OAuthButton />

      <Muted className="mt-6 text-center">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </Muted>
    </AuthCard>
  );
}
