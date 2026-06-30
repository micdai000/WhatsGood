"use client";

import { useEffect, useState } from "react";
import { getProfessionsAction } from "@/app/actions/onboarding.actions";
import { OnboardingWizardShell } from "@/components/onboarding/onboarding-wizard-shell";
import { LoadingState } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOnboardingWizard } from "@/hooks/use-onboarding-wizard";
import { onboardingProfessionSchema } from "@/lib/validators";
import { isFailure } from "@/types";
import type { Profession } from "@/types";

export function ProfessionStep() {
  const { state, updateState, isReady } = useOnboardingWizard();
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    getProfessionsAction().then((result) => {
      if (isFailure(result)) {
        setError(result.error.message);
      } else {
        setProfessions(result.data);
      }
      setLoading(false);
    });
  }, []);

  if (!isReady || loading) {
    return <LoadingState label="Loading professions…" fullPage />;
  }

  if (error) {
    const isMissingTable =
      error.includes("public.professions") ||
      error.includes("schema cache");
    return (
      <ErrorState
        title="Unable to load professions"
        description={
          isMissingTable
            ? `${error} Apply database migration 011: run npm run db:migrate (see docs/database-migrations.md).`
            : error
        }
        onRetry={() => window.location.reload()}
        className="mx-auto max-w-lg"
      />
    );
  }

  return (
    <OnboardingWizardShell
      title="What do you do?"
      description="Choose the profession that best describes your work."
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
      <RadioGroup
        value={state.professionId ?? ""}
        onValueChange={(value) => {
          updateState({ professionId: value });
          setFieldError(null);
        }}
        className="grid gap-3"
        aria-label="Profession"
      >
        {professions.map((profession) => (
          <Label
            key={profession.id}
            htmlFor={profession.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
          >
            <RadioGroupItem value={profession.id} id={profession.id} />
            <span className="font-medium">{profession.name}</span>
          </Label>
        ))}
      </RadioGroup>
      {fieldError ? (
        <p className="text-sm text-destructive" role="alert">
          {fieldError}
        </p>
      ) : null}
    </OnboardingWizardShell>
  );
}
