import { Container } from "@/components/layout/container";
import { PROFESSIONS_DISCOVERY_COPY } from "@/lib/professions/display";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingResults } from "@/components/search";

export default function SearchLoading() {
  return (
    <Section spacing="default">
      <Container className="space-y-6">
        <PageHeader
          title="Find professionals"
          description={`Discover trusted professionals in ${PROFESSIONS_DISCOVERY_COPY} on Meritt Pros.`}
        />
        <LoadingResults />
      </Container>
    </Section>
  );
}
