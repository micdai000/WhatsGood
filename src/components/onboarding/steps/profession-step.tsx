import { useState } from "react";
import { OnboardingWizardShell } from "@/components/onboarding/onboarding-wizard-shell";
import { ProfessionField } from "@/components/profile-fields";
import { useOnboardingWizard } from "@/hooks/use-onboarding-wizard";
import { onboardingProfessionSchema } from "@/lib/validators";

export function ProfessionStep() {
  const { state, updateState, isReady } = useOnboardingWizard();
  const [fieldError, setFieldError] = useState<string | null>(null);

  if (!isReady) return null;

  return (
    <OnboardingWizardShell
      title="What do you do?"
      description="Select the service category that best describes what you offer."
      continueDisabled={!state.professionId}
      onContinue={() => {
        const parsed = onboardingProfessionSchema.safeParse({
          professionId: state.professionId,
        });

        if (!parsed.success) {
          setFieldError(parsed.error.issues[0]?.message ?? "Please select a profession");
          return false;
        }

        setFieldError(null);
        return true;
      }}
    >
      <ProfessionField
        value={state.professionId}
        onChange={(professionId) => {
          updateState({ professionId });
          setFieldError(null);
        }}
        error={fieldError ?? undefined}
      />
    </OnboardingWizardShell>
  );
}
