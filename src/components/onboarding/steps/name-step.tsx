"use client";

import { useState } from "react";
import { OnboardingWizardShell } from "@/components/onboarding/onboarding-wizard-shell";
import { DisplayNameField } from "@/components/profile-fields";
import { useOnboardingWizard } from "@/hooks/use-onboarding-wizard";
import { onboardingDisplayNameSchema } from "@/lib/validators";

export function NameStep() {
  const { state, updateState, isReady } = useOnboardingWizard();
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
      <DisplayNameField
        value={state.fullName}
        onChange={(fullName) => {
          updateState({ fullName });
          setFieldError(null);
        }}
        error={fieldError ?? undefined}
      />
    </OnboardingWizardShell>
  );
}
