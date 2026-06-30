"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { OnboardingWizardShell } from "@/components/onboarding/onboarding-wizard-shell";
import { UsernameField } from "@/components/onboarding/username-field";
import { useOnboardingWizard } from "@/hooks/use-onboarding-wizard";
import { onboardingUsernameSchema } from "@/lib/validators";
import { checkSlugAvailabilityAction } from "@/app/actions/onboarding.actions";

export function UsernameStep() {
  const pathname = usePathname();
  const { state, updateState, isReady } = useOnboardingWizard(pathname);
  const [fieldError, setFieldError] = useState<string | null>(null);

  if (!isReady) return null;

  return (
    <OnboardingWizardShell
      title="Choose your username"
      description="Pick a unique handle for your public TrustLoop profile."
      continueDisabled={!state.slug.trim()}
      onContinue={async () => {
        const parsed = onboardingUsernameSchema.safeParse({ slug: state.slug });

        if (!parsed.success) {
          setFieldError(parsed.error.issues[0]?.message ?? "Invalid username");
          return false;
        }

        const availability = await checkSlugAvailabilityAction(parsed.data.slug);

        if (!availability.success) {
          setFieldError(availability.message);
          return false;
        }

        if (!availability.data.available) {
          setFieldError("This username is already taken.");
          return false;
        }

        updateState({ slug: parsed.data.slug });
        setFieldError(null);
        return true;
      }}
    >
      <UsernameField
        value={state.slug}
        onChange={(slug) => {
          updateState({ slug });
          setFieldError(null);
        }}
        error={fieldError ?? undefined}
      />
    </OnboardingWizardShell>
  );
}
