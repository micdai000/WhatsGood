import { Container } from "@/components/layout/container";
import { MerittSection } from "@/components/ui/meritt-surface";
import { PageHeader } from "@/components/layout/page-header";
import { Paragraph } from "@/components/typography/typography";

export default function AboutPage() {
  return (
    <MerittSection variant="white" className="py-14 sm:py-20">
      <Container className="space-y-4">
        <PageHeader
          title="About Meritt Pros"
          description="Helping independent professionals build credibility through verified client reviews."
        />
        <Paragraph className="max-w-2xl text-muted-foreground">
          Meritt Pros gives tutors, coaches, consultants, and other independent
          experts a simple way to collect authentic feedback and showcase their
          reputation.
        </Paragraph>
      </Container>
    </MerittSection>
  );
}
