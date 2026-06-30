import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { Paragraph } from "@/components/typography/typography";

export default function AboutPage() {
  return (
    <Section>
      <Container className="space-y-4">
        <PageHeader
          title="About TrustLoop"
          description="Helping independent professionals build credibility through verified client reviews."
        />
        <Paragraph className="max-w-2xl text-muted-foreground">
          TrustLoop gives tutors, coaches, consultants, and other independent
          experts a simple way to collect authentic feedback and showcase their
          reputation.
        </Paragraph>
      </Container>
    </Section>
  );
}
