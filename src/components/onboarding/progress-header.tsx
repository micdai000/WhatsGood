import { PageTitle, Muted } from "@/components/typography/typography";
import { ProgressIndicator } from "@/components/onboarding/progress-indicator";
import { cn } from "@/lib/utils";

interface ProgressHeaderProps {
  title: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressHeader({
  title,
  description,
  currentStep,
  totalSteps,
  className,
}: ProgressHeaderProps) {
  return (
    <header className={cn("space-y-6", className)}>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div className="space-y-2">
        <PageTitle>{title}</PageTitle>
        {description ? <Muted>{description}</Muted> : null}
      </div>
    </header>
  );
}
