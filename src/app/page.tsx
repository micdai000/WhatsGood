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
import { ActivityFeed } from "@/components/ui/activity-feed";
import { BelowFoldLoader } from "@/components/home/below-fold-loader";

const quickActions = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/libraries", label: "Libraries", icon: BookOpen },
  { href: "/create", label: "Add", icon: Plus },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-white pb-6">
      <header className="page-x pt-6 sm:pt-8">
        <h1 className="text-[28px] font-bold tracking-tight text-[#111] sm:text-3xl">
          Meritt
        </h1>
        <p className="mt-1 max-w-sm text-[15px] leading-relaxed text-neutral-500">
          What people believe is worth choosing.
        </p>
      </header>

      <div className="page-x mt-6 grid grid-cols-3 gap-2.5">
        {quickActions.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-50 py-4 ring-1 ring-neutral-100 transition-colors hover:bg-neutral-100"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111] shadow-sm ring-1 ring-neutral-100">
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <span className="text-[13px] font-semibold text-[#111]">{label}</span>
          </Link>
        ))}
      </div>

      <section className="page-x mt-8">
        <div className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-100 sm:p-5">
          <div className="mb-1">
            <h2 className="text-lg font-bold tracking-tight text-[#111]">
              Happening Now
            </h2>
            <p className="text-[13px] text-neutral-400">
              Live from the community
            </p>
          </div>
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
