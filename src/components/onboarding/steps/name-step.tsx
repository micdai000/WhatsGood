"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { OnboardingWizardShell } from "@/components/onboarding/onboarding-wizard-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboardingWizard } from "@/hooks/use-onboarding-wizard";
import { onboardingDisplayNameSchema } from "@/lib/validators";

export function NameStep() {
  const pathname = usePathname();
  const { state, updateState, isReady } = useOnboardingWizard(pathname);
  const [fieldError, setFieldError] = useState<string | null>(null);

  if (!isReady) return null;

  return (
    <OnboardingWizardShell
      title="What's your name?"
      description="This is how clients will see you on your public profile."
      continueDisabled={!state.fullName.trim()}
      onContinue={() => {
        const parsed = onboardingDisplayNameSchema.safeParse({
          fullName: state.fullName.trim(),
        });

        if (!parsed.success) {
          setFieldError(parsed.error.issues[0]?.message ?? "Invalid display name");
          return false;
        }

        updateState({ fullName: parsed.data.fullName });
        setFieldError(null);
        return true;
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="fullName">Display name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={state.fullName}
          onChange={(event) => {
            updateState({ fullName: event.target.value });
            setFieldError(null);
          }}
          autoComplete="name"
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? "fullName-error" : undefined}
        />
        {fieldError ? (
          <p id="fullName-error" className="text-sm text-destructive" role="alert">
            {fieldError}
          </p>
        ) : null}
      </div>
    </OnboardingWizardShell>
  );
}
