import { ActivityFeed } from "@/components/ui/activity-feed";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionTitle, Muted } from "@/components/typography/typography";
import type { ActivityItem } from "@/data/mock";

interface HomeActivitySectionProps {
  items: ActivityItem[];
  /** When true, skips outer section wrapper (parent provides layout). */
  embedded?: boolean;
}

export function HomeActivitySection({
  items,
  embedded = false,
}: HomeActivitySectionProps) {
  const content = (
    <div className="space-y-4">
      <div>
        <SectionTitle>Happening Now</SectionTitle>
        <Muted className="mt-0.5">Live from the community</Muted>
      </div>
      <div className="meritt-card p-4">
        <ActivityFeed items={items} />
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <Section spacing="tight" className="pt-0">
      <Container>{content}</Container>
    </Section>
  );
}
