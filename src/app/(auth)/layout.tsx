import { PageWrapper } from "@/components/layout/page-wrapper";
import { Container } from "@/components/layout/container";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageWrapper variant="muted">
      <Container className="flex min-h-[calc(100dvh-4rem)] items-center justify-center py-10">
        {children}
      </Container>
    </PageWrapper>
  );
}
