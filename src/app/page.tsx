import Link from "next/link";
import { Search, BookOpen, Plus } from "lucide-react";
import {
  eliteEntities,
  trendingUpEntities,
  mostFollowedEntities,
  homeLibraries,
  trendingDownEntities,
  recentlyAddedEntities,
  homeActivity,
} from "@/data/home-feed";
import { BelowFoldLoader } from "@/components/home/below-fold-loader";
import { HomeActivitySection } from "@/components/home/home-activity-section";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { H1, Muted } from "@/components/typography/typography";

const quickActions = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/libraries", label: "Libraries", icon: BookOpen },
  { href: "/create", label: "Add", icon: Plus },
] as const;

export default function HomePage() {
  return (
    <PageWrapper>
      <Section spacing="tight" className="pb-0 pt-8 sm:pt-10">
        <Container>
          <div className="max-w-sm space-y-1">
            <H1>Meritt</H1>
            <Muted>What people believe is worth choosing.</Muted>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {quickActions.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-50 py-4 ring-1 ring-neutral-100 transition-colors hover:bg-neutral-100"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111] shadow-sm ring-1 ring-neutral-100">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
                <span className="text-[13px] font-semibold text-[#111]">
                  {label}
                </span>
              </Link>
            ))}
          </div>
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
