"use client";

import { Button } from "@/components/ui/button";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { ProgressFooter } from "@/components/onboarding/progress-footer";
import { ProgressHeader } from "@/components/onboarding/progress-header";
import { Paragraph } from "@/components/typography/typography";

const TOTAL_ONBOARDING_STEPS = 6;

export function WelcomeContent() {
  return (
    <OnboardingLayout>
      <div className="space-y-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <ProgressHeader
          title="Welcome to TrustLoop"
          description="Let's set up your professional presence."
          currentStep={1}
          totalSteps={TOTAL_ONBOARDING_STEPS}
        />

        <Paragraph className="text-muted-foreground">
          You&apos;re about to create your professional profile — the page where
          clients can discover you, read verified reviews, and build trust in
          your work.
        </Paragraph>

        <ProgressFooter hint="Profile setup opens in the next phase.">
          <Button type="button" className="w-full" size="lg">
            Create My Profile
          </Button>
        </ProgressFooter>
      </div>
    </OnboardingLayout>
  );
}
