import { Container } from "@/components/layout/container";
import { SITE_NAME } from "@/lib/seo/site";
import { PROFESSIONS_DISCOVERY_COPY } from "@/lib/professions/display";
import { MerittSection } from "@/components/ui/meritt-surface";
import { PageHeader } from "@/components/layout/page-header";
import { Paragraph } from "@/components/typography/typography";

export default function AboutPage() {
  return (
    <MerittSection variant="white" className="py-14 sm:py-20">
      <Container className="space-y-4">
        <PageHeader
          title={`About ${SITE_NAME}`}
          description="Helping independent professionals build credibility through verified client feedback and monthly reputation tiers."
        />
        <Paragraph className="max-w-2xl text-muted-foreground">
          {SITE_NAME} helps independent service professionals — in{" "}
          {PROFESSIONS_DISCOVERY_COPY} — collect authentic feedback and showcase
          their reputation.
        </Paragraph>
      </Container>
    </MerittSection>
  );
}
