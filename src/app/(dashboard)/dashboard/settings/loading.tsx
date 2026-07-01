import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <Section>
      <Container size="narrow" className="space-y-8" aria-busy="true" aria-label="Loading settings">
        <PageHeader
          title="Account settings"
          description="Loading your account preferences…"
        />
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </Container>
    </Section>
  );
}
