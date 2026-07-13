import { Container } from "@/components/layout/container";
import { MerittSection } from "@/components/ui/meritt-surface";
import { PageHeader } from "@/components/layout/page-header";
import { Paragraph } from "@/components/typography/typography";

export default function PricingPage() {
  return (
    <MerittSection variant="surface" className="py-14 sm:py-20">
      <Container className="space-y-4">
        <PageHeader
          title="Pricing"
          description="Simple plans for professionals getting started."
        />
        <div className="meritt-card max-w-2xl p-6">
          <Paragraph className="text-muted-foreground">
            Meritt Pros is free during early access. Premium features for custom
            domains and advanced analytics are coming soon.
          </Paragraph>
        </div>
      </Container>
    </MerittSection>
  );
}
