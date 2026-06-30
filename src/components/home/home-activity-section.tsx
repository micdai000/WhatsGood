import { ActivityFeed } from "@/components/ui/activity-feed";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionTitle, Muted } from "@/components/typography/typography";
import type { ActivityItem } from "@/data/mock";

interface HomeActivitySectionProps {
  items: ActivityItem[];
}

export function HomeActivitySection({ items }: HomeActivitySectionProps) {
  return (
    <Section spacing="tight" className="pt-0">
      <Container className="space-y-4">
        <div>
          <SectionTitle>Happening Now</SectionTitle>
          <Muted className="mt-0.5">Live from the community</Muted>
        </div>
        <ActivityFeed items={items} />
      </Container>
    </Section>
  );
}
