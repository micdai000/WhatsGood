import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { Paragraph } from "@/components/typography/typography";

export default function PricingPage() {
  return (
    <Section>
      <Container className="space-y-4">
        <PageHeader
          title="Pricing"
          description="Simple plans for professionals getting started."
        />
        <Paragraph className="max-w-2xl text-muted-foreground">
          TrustLoop is free during early access. Premium features for custom
          domains and advanced analytics are coming soon.
        </Paragraph>
      </Container>
    </Section>
  );
}
