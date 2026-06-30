"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { ProgressFooter } from "@/components/onboarding/progress-footer";
import { ProgressHeader } from "@/components/onboarding/progress-header";
import { LoadingState } from "@/components/layout/loading-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ONBOARDING } from "@/lib/constants";
import {
  getNextRoute,
  getPreviousRoute,
  getStepMetaForRoute,
} from "@/lib/onboarding/wizard-state";
import { useOnboardingWizard } from "@/hooks/use-onboarding-wizard";

interface OnboardingWizardShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onContinue?: () => boolean | Promise<boolean>;
  continueLabel?: string;
  continueDisabled?: boolean;
  hideBack?: boolean;
}

export function OnboardingWizardShell({
  title,
  description,
  children,
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
  hideBack = false,
}: OnboardingWizardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isReady } = useOnboardingWizard();
  const stepMeta = getStepMetaForRoute(pathname);
  const previousRoute = getPreviousRoute(pathname);
  const nextRoute = getNextRoute(pathname);

  if (!isReady) {
    return <LoadingState label="Loading your progress…" fullPage />;
  }

  async function handleContinue() {
    if (onContinue) {
      const canContinue = await onContinue();
      if (!canContinue) return;
    }

    if (nextRoute) {
      router.push(nextRoute);
    }
  }

  return (
    <OnboardingLayout>
      <div className="space-y-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <ProgressHeader
          title={title}
          description={description}
          currentStep={stepMeta.step}
          totalSteps={ONBOARDING.TOTAL_STEPS}
        />

        {children}

        <ProgressFooter>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {!hideBack && previousRoute ? (
              <Link
                href={previousRoute}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full sm:w-auto",
                )}
              >
                Back
              </Link>
            ) : (
              <span />
            )}
            {nextRoute || onContinue ? (
              <Button
                type="button"
                className="w-full sm:ml-auto sm:w-auto"
                disabled={continueDisabled}
                onClick={handleContinue}
              >
                {continueLabel}
              </Button>
            ) : null}
          </div>
        </ProgressFooter>
      </div>
    </OnboardingLayout>
  );
}
