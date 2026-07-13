import { OnboardingWizardShell } from "@/components/onboarding/onboarding-wizard-shell";
import { ProfilePhotoField } from "@/components/profile-fields";
import { useOnboardingWizard } from "@/hooks/use-onboarding-wizard";

export function PhotoStep() {
  const { state, updateState, isReady } = useOnboardingWizard();

  if (!isReady) return null;

  return (
    <OnboardingWizardShell
      title="Add a profile photo"
      description="A friendly photo helps clients connect with you. You can skip this for now."
      continueLabel={state.profilePhotoUrl ? "Continue" : "Skip for now"}
    >
      <ProfilePhotoField
        value={state.profilePhotoUrl}
        onChange={(profilePhotoUrl) => updateState({ profilePhotoUrl })}
        displayName={state.fullName || "Profile"}
      />
    </OnboardingWizardShell>
  );
}
