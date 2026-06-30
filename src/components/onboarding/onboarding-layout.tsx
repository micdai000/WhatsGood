import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { cn } from "@/lib/utils";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function OnboardingLayout({
  children,
  className,
}: OnboardingLayoutProps) {
  return (
    <PageWrapper variant="muted">
      <Container
        className={cn(
          "flex min-h-[calc(100dvh-4rem)] max-w-2xl flex-col justify-center py-10 sm:py-14",
          className,
        )}
      >
        {children}
      </Container>
    </PageWrapper>
  );
}
