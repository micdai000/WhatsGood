import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { ProgressFooter } from "@/components/onboarding/progress-footer";
import { ProgressHeader } from "@/components/onboarding/progress-header";
import { Paragraph } from "@/components/typography/typography";
import { ONBOARDING } from "@/lib/constants";
import { ONBOARDING_ROUTES } from "@/lib/onboarding/constants";

export function WelcomeContent() {
  return (
    <OnboardingLayout>
      <div className="space-y-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <ProgressHeader
          title="Welcome to Meritt Pros"
          description="Let's set up your professional presence."
          currentStep={1}
          totalSteps={ONBOARDING.TOTAL_STEPS}
        />

        <Paragraph className="text-muted-foreground">
          You&apos;re about to create your professional profile — the page where
          clients can discover you, read verified reviews, and build trust in
          your work.
        </Paragraph>

        <ProgressFooter>
          <Link
            to={ONBOARDING_ROUTES.profession}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Create My Profile
          </Link>
        </ProgressFooter>
      </div>
    </OnboardingLayout>
  );
}
