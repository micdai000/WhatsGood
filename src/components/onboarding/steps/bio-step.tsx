"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { OnboardingWizardShell } from "@/components/onboarding/onboarding-wizard-shell";
import { CharacterCounter } from "@/components/onboarding/character-counter";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LIMITS } from "@/lib/constants";
import { useOnboardingWizard } from "@/hooks/use-onboarding-wizard";
import { onboardingBioSchema } from "@/lib/validators";

export function BioStep() {
  const pathname = usePathname();
  const { state, updateState, isReady } = useOnboardingWizard(pathname);
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
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="bio">Bio (optional)</Label>
          <CharacterCounter
            value={state.bio}
            maxLength={LIMITS.BIO_MAX_LENGTH}
          />
        </div>
        <Textarea
          id="bio"
          name="bio"
          value={state.bio}
          onChange={(event) => {
            updateState({ bio: event.target.value });
            setFieldError(null);
          }}
          rows={5}
          maxLength={LIMITS.BIO_MAX_LENGTH}
          placeholder="I've helped students improve their math scores for over 10 years…"
          aria-invalid={Boolean(fieldError)}
        />
        {fieldError ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldError}
          </p>
        ) : null}
      </div>
    </OnboardingWizardShell>
  );
}
