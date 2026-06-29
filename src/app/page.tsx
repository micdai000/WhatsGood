import Image from "next/image";
import Link from "next/link";
import { categoryLabels, formatCount } from "@/data/mock";
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
import { ActivityFeed } from "@/components/ui/activity-feed";
import { TierBadge } from "@/components/ui/tier-badge";
import { BelowFoldLoader } from "@/components/home/below-fold-loader";

export default function HomePage() {
  return (
    <div className="bg-white min-h-dvh pb-6 overflow-x-hidden">
      <header className="page-x pt-6 pb-2 sm:pt-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#111]">
          Meritt
        </h1>
      </header>

      <p className="page-x pb-6 text-[15px] text-neutral-400">
        What people believe is worth choosing.
      </p>

      <Link
        href={`/entity/${featuredEntity.id}`}
        className="page-x block rounded-2xl overflow-hidden border border-neutral-100"
      >
        <div className="relative hero-media">
          <Image
            src={featuredEntity.image}
            alt={featuredEntity.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2.5">
            <TierBadge tier={featuredEntity.tier} size="lg" />
            <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-medium">
              {categoryLabels[featuredEntity.category]}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#111] mt-1.5">
            {featuredEntity.name}
          </h2>
          <div className="mt-3 flex items-center gap-1.5 text-[13px] text-neutral-400">
            <span className="text-sm font-semibold tabular-nums text-[#111]">
              {featuredEntity.score > 0 ? "+" : ""}
              {featuredEntity.score}
            </span>
            <span>&middot;</span>
            <span>{formatCount(featuredEntity.totalVotes)} votes</span>
            <span>&middot;</span>
            <span>{formatCount(featuredEntity.followersCount)} followers</span>
          </div>
        </div>
      </Link>

      <section className="section-gap">
        <div className="page-x">
          <h2 className="text-lg font-bold text-[#111] tracking-tight sm:text-xl">
            Happening Now
          </h2>
          <p className="text-[13px] text-neutral-400 mt-0.5">
            Live from the community
          </p>
        </div>
        <div className="page-x">
          <ActivityFeed items={homeActivity} />
        </div>
      </section>

      <BelowFoldLoader
        eliteEntities={eliteEntities}
        trendingUpEntities={trendingUpEntities}
        mostFollowedEntities={mostFollowedEntities}
        homeLibraries={homeLibraries}
        trendingDownEntities={trendingDownEntities}
        recentlyAddedEntities={recentlyAddedEntities}
      />
    </div>
  );
}
