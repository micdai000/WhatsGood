"use client";

import { OnboardingWizardProvider } from "@/contexts/onboarding-wizard-context";

export default function OnboardingWizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingWizardProvider>{children}</OnboardingWizardProvider>;
}
