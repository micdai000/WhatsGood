import { useState } from "react";
import { OnboardingWizardShell } from "@/components/onboarding/onboarding-wizard-shell";
import { LocationFields } from "@/components/profile-fields";
import { useOnboardingWizard } from "@/hooks/use-onboarding-wizard";
import { onboardingLocationSchema } from "@/lib/validators";

export function LocationStep() {
  const { state, updateState, isReady } = useOnboardingWizard();
  const [fieldErrors, setFieldErrors] = useState<{
    city?: string;
    state?: string;
  }>({});

  if (!isReady) return null;

  return (
    <OnboardingWizardShell
      title="Where are you based?"
      description="Help local clients find professionals in their area."
      continueDisabled={!state.city.trim() || !state.state.trim()}
      onContinue={() => {
        const parsed = onboardingLocationSchema.safeParse({
          city: state.city.trim(),
          state: state.state.trim(),
        });

        if (!parsed.success) {
          const errors: { city?: string; state?: string } = {};
          for (const issue of parsed.error.issues) {
            const field = issue.path[0];
            if (field === "city" || field === "state") {
              errors[field] = issue.message;
            }
          }
          setFieldErrors(errors);
          return false;
        }

        updateState({
          city: parsed.data.city,
          state: parsed.data.state,
        });
        setFieldErrors({});
        return true;
      }}
    >
      <LocationFields
        city={state.city}
        state={state.state}
        onCityChange={(city) => {
          updateState({ city });
          setFieldErrors((prev) => ({ ...prev, city: undefined }));
        }}
        onStateChange={(stateValue) => {
          updateState({ state: stateValue });
          setFieldErrors((prev) => ({ ...prev, state: undefined }));
        }}
        errors={fieldErrors}
      />
    </OnboardingWizardShell>
  );
}
