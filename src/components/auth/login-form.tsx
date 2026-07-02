"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInAction, type AuthActionState } from "@/app/actions/auth.actions";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthDivider } from "@/components/auth/auth-divider";
import {
  AuthFormError,
  AuthFormSuccess,
} from "@/components/auth/auth-form-feedback";
import { OAuthButton } from "@/components/auth/oauth-button";
import { PasswordInput } from "@/components/auth/password-input";
import { RememberMeCheckbox } from "@/components/auth/remember-me";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Muted } from "@/components/typography/typography";

const initialState: AuthActionState = { success: false };
const FORM_ERROR_ID = "login-form-error";

export function LoginForm() {
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "true";
  const errorCode = searchParams.get("error");
  const redirectTo = searchParams.get("redirect");
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  const expiredMessage =
    errorCode === "EXPIRED_TOKEN"
      ? "This link has expired. Please request a new one."
      : undefined;

  const describedBy = [
    state.fieldErrors?.email ? "email-error" : null,
    state.message || expiredMessage ? FORM_ERROR_ID : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your TrustLoop account"
    >
      {verified ? (
        <AuthFormSuccess message="Email verified. You can now sign in." />
      ) : null}
      {expiredMessage ? (
        <AuthFormError
          id={FORM_ERROR_ID}
          message={expiredMessage}
          code="EXPIRED_TOKEN"
        />
      ) : null}
      {!state.success ? (
        <AuthFormError
          id={FORM_ERROR_ID}
          message={state.message}
          code={state.code}
        />
      ) : null}

      <form action={formAction} className="space-y-4">
        {redirectTo ? (
          <input type="hidden" name="redirect" value={redirectTo} />
        ) : null}
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
            aria-describedby={describedBy || undefined}
          />
          {state.fieldErrors?.email ? (
            <Muted id="email-error" className="text-destructive">
              {state.fieldErrors.email[0]}
            </Muted>
          ) : null}
        </div>

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={describedBy || undefined}
        />

        <div className="flex items-center justify-between gap-4">
          <RememberMeCheckbox />
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <AuthDivider />
      <OAuthButton />

      <Muted className="mt-6 text-center">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-foreground hover:underline">
          Sign up
        </Link>
      </Muted>
    </AuthCard>
  );
}
