import { useActionState } from "react";
import { useState } from "react";
import {
  updatePasswordAction,
  type AuthActionState,
} from "@/app/actions/auth.actions";
import {
  AuthFormError,
  AuthFormSuccess,
} from "@/components/auth/auth-form-feedback";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = { success: false };

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <div className="space-y-4">
      {state.success ? (
        <AuthFormSuccess message={state.message} />
      ) : (
        <AuthFormError message={state.message} code={state.code} />
      )}

      {!state.success ? (
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <PasswordInput
              id="settings-password"
              name="password"
              label="New password"
              autoComplete="new-password"
              required
              onPasswordChange={setPassword}
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-confirmPassword">Confirm password</Label>
            <Input
              id="settings-confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
