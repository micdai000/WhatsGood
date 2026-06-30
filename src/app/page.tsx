import {
  featuredEntity,
  eliteEntities,
  trendingUpEntities,
  mostFollowedEntities,
  homeLibraries,
  trendingDownEntities,
  recentlyAddedEntities,
  homeActivity,
} from "@/data/home-feed";
import { BelowFoldLoader } from "@/components/home/below-fold-loader";
import { FeaturedEntityCard } from "@/components/home/featured-entity-card";
import { HomeActivitySection } from "@/components/home/home-activity-section";
import { HomeHero } from "@/components/home/home-hero";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";

export default function HomePage() {
  return (
    <PageWrapper>
      <HomeHero />

      <Section spacing="tight" className="pt-0">
        <Container>
          <FeaturedEntityCard entity={featuredEntity} />
        </Container>
      </Section>

      <HomeActivitySection items={homeActivity} />

      <BelowFoldLoader
        eliteEntities={eliteEntities}
        trendingUpEntities={trendingUpEntities}
        mostFollowedEntities={mostFollowedEntities}
        homeLibraries={homeLibraries}
        trendingDownEntities={trendingDownEntities}
        recentlyAddedEntities={recentlyAddedEntities}
      />
    </PageWrapper>
  );
}
