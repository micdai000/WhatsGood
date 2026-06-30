import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { Paragraph } from "@/components/typography/typography";

export default function DashboardPage() {
  return (
    <Section>
      <Container className="space-y-4">
        <PageHeader
          title="Dashboard"
          description="Your professional command center."
        />
        <Paragraph className="max-w-2xl text-muted-foreground">
          Your dashboard is coming soon. Once you complete profile setup, this
          is where you&apos;ll manage reviews, track reputation, and share your
          TrustLoop link.
        </Paragraph>
      </Container>
    </Section>
  );
}
