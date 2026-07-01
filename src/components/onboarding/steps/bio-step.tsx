"use client";

import { useState } from "react";
import { OnboardingWizardShell } from "@/components/onboarding/onboarding-wizard-shell";
import { BioField } from "@/components/profile-fields";
import { useOnboardingWizard } from "@/hooks/use-onboarding-wizard";
import { onboardingBioSchema } from "@/lib/validators";

export function BioStep() {
  const { state, updateState, isReady } = useOnboardingWizard();
  const [fieldError, setFieldError] = useState<string | null>(null);

  if (!isReady) return null;

  return (
    <OnboardingWizardShell
      title="Tell your story"
      description="Share a short bio about your experience and what clients can expect."
      onContinue={() => {
        const parsed = onboardingBioSchema.safeParse({ bio: state.bio });

        if (!parsed.success) {
          setFieldError(parsed.error.issues[0]?.message ?? "Invalid bio");
          return false;
        }

        setFieldError(null);
        return true;
      }}
    >
      <BioField
        value={state.bio}
        onChange={(bio) => {
          updateState({ bio });
          setFieldError(null);
        }}
        error={fieldError ?? undefined}
      />
    </OnboardingWizardShell>
  );
}
