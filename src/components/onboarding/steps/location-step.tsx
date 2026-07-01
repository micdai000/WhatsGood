"use client";

import { useState } from "react";
import { OnboardingWizardShell } from "@/components/onboarding/onboarding-wizard-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={state.city}
            onChange={(event) => {
              updateState({ city: event.target.value });
              setFieldErrors((prev) => ({ ...prev, city: undefined }));
            }}
            autoComplete="address-level2"
            aria-invalid={Boolean(fieldErrors.city)}
          />
          {fieldErrors.city ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.city}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={state.state}
            onChange={(event) => {
              updateState({ state: event.target.value });
              setFieldErrors((prev) => ({ ...prev, state: undefined }));
            }}
            autoComplete="address-level1"
            aria-invalid={Boolean(fieldErrors.state)}
          />
          {fieldErrors.state ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.state}
            </p>
          ) : null}
        </div>
      </div>
    </OnboardingWizardShell>
  );
}
