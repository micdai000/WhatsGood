import { allEntities, libraries, activityFeed, formatCount, categoryLabels } from "@/data/mock";
import { EntityCard } from "@/components/ui/entity-card";
import { LibraryCard } from "@/components/ui/library-card";
import { SectionHeader } from "@/components/ui/section-header";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { TierBadge } from "@/components/ui/tier-badge";
import { TrendingDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const featured = [...allEntities].sort((a, b) => b.score - a.score)[0];

  const eliteEntities = allEntities
    .filter((e) => e.tier === "elite")
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const trendingUp = allEntities
    .filter((e) => e.trending === "up")
    .sort((a, b) => b.score - a.score);

  const trendingDown = allEntities.filter((e) => e.trending === "down");

  const mostFollowed = [...allEntities]
    .sort((a, b) => b.followersCount - a.followersCount)
    .slice(0, 8);

  const recentlyAdded = allEntities.filter((e) => e.recentlyAdded);

  return (
    <div className="bg-white min-h-screen pb-6">
      {/* Header */}
      <header className="px-5 pt-8 pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#111]">
          Meritt
        </h1>
      </header>

      {/* Tagline */}
      <p className="px-5 pb-6 text-[15px] text-neutral-400">
        What people believe is worth choosing.
      </p>

      {/* Featured Entity */}
      <Link href={`/entity/${featured.id}`} className="block mx-5 rounded-2xl overflow-hidden border border-neutral-100">
        <div className="relative h-[320px] lg:h-[400px]">
          <Image
            src={featured.image}
            alt={featured.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2.5">
            <TierBadge tier={featured.tier} size="lg" />
            <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-medium">
              {categoryLabels[featured.category]}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#111] mt-1.5">
            {featured.name}
          </h2>
          <p className="text-[14px] text-neutral-500 mt-1 leading-relaxed line-clamp-2">
            {featured.description}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[13px] text-neutral-400">
            <span className="text-sm font-semibold tabular-nums text-[#111]">
              {featured.score > 0 ? "+" : ""}{featured.score}
            </span>
            <span>&middot;</span>
            <span>{formatCount(featured.totalVotes)} votes</span>
            <span>&middot;</span>
            <span>{formatCount(featured.followersCount)} followers</span>
          </div>
        </div>
      </Link>

      {/* Activity */}
      <section className="mt-10">
        <div className="px-5">
          <SectionHeader
            title="Happening Now"
            subtitle="Live from the community"
          />
        </div>
        <div className="px-5">
          <ActivityFeed items={activityFeed.slice(0, 5)} />
        </div>
      </section>

      {/* Elite Right Now */}
      <section className="mt-12">
        <div className="px-5">
          <SectionHeader
            title="Elite Right Now"
            subtitle="The highest reputation across all categories"
          />
        </div>
        <div className="flex gap-4 overflow-x-auto px-5 pb-1 snap-x snap-mandatory hide-scrollbar">
          {eliteEntities.map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              size="large"
              className="snap-start"
            />
          ))}
        </div>
      </section>

      {/* Gaining Momentum */}
      <section className="mt-12">
        <div className="px-5">
          <SectionHeader
            title="Gaining Momentum"
            subtitle="Rising through the ranks right now"
          />
        </div>
        <div className="flex gap-4 overflow-x-auto px-5 pb-1 snap-x snap-mandatory hide-scrollbar">
          {trendingUp.map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              size="large"
              className="snap-start"
            />
          ))}
        </div>
      </section>

      {/* Most Followed */}
      <section className="mt-12">
        <div className="px-5">
          <SectionHeader
            title="Most Followed"
            subtitle="The ones people want to keep track of"
          />
        </div>
        <div className="flex gap-4 overflow-x-auto px-5 pb-1 snap-x snap-mandatory hide-scrollbar">
          {mostFollowed.map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              size="large"
              className="snap-start"
            />
          ))}
        </div>
      </section>

      {/* Libraries */}
      <section className="mt-12">
        <div className="px-5">
          <SectionHeader
            title="Libraries"
            subtitle="Curated collections from the community"
          />
        </div>
        <div className="flex gap-4 overflow-x-auto px-5 pb-1 snap-x snap-mandatory hide-scrollbar">
          {libraries.map((lib) => (
            <LibraryCard
              key={lib.id}
              library={lib}
              className="snap-start"
            />
          ))}
        </div>
      </section>

      {/* Losing Ground */}
      <section className="mt-12">
        <div className="px-5">
          <SectionHeader
            title="Losing Ground"
            subtitle="Falling in the court of public opinion"
          />
          <div>
            {trendingDown.map((entity, i) => (
              <Link
                key={entity.id}
                href={`/entity/${entity.id}`}
                className="flex items-center gap-4 py-3.5 border-b border-neutral-100 last:border-0"
              >
                <span className="text-2xl font-bold text-neutral-200 tabular-nums w-8 text-center shrink-0">
                  {i + 1}
                </span>
                <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden">
                  <Image
                    src={entity.image}
                    alt={entity.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-semibold text-[#111] truncate">
                    {entity.name}
                  </h3>
                  <p className="text-[12px] text-neutral-400">
                    {categoryLabels[entity.category]}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[14px] text-red-400 font-semibold tabular-nums">
                    {entity.score > 0 ? "+" : ""}{entity.score}
                  </span>
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Just Added */}
      <section className="mt-12 mb-6">
        <div className="px-5">
          <SectionHeader
            title="Just Added"
            subtitle="Fresh arrivals from the community"
          />
        </div>
        <div className="flex gap-4 overflow-x-auto px-5 pb-1 snap-x snap-mandatory hide-scrollbar">
          {recentlyAdded.map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              size="large"
              className="snap-start"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
