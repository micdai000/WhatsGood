"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { currentUser, libraryMatchesQuery } from "@/data/mock";
import { useLibraries } from "@/lib/libraries-store";
import { LibraryCard } from "@/components/ui/library-card";

type LibraryTab = "yours" | "explore";

export default function LibrariesPage() {
  const [activeTab, setActiveTab] = useState<LibraryTab>("yours");
  const [exploreQuery, setExploreQuery] = useState("");
  const { libraries } = useLibraries();

  const myLibraries = libraries.filter(
    (l) => l.creator.id === currentUser.id,
  );

  const q = exploreQuery.trim();

  const exploreLibraries = useMemo(() => {
    const publicLibraries = libraries.filter((library) => library.isPublic);
    if (!q) return publicLibraries;
    return publicLibraries.filter((library) => libraryMatchesQuery(library, q));
  }, [libraries, q]);

  const tabs: { key: LibraryTab; label: string }[] = [
    { key: "yours", label: "Yours" },
    { key: "explore", label: "Explore" },
  ];

  return (
    <div className="w-full py-6">
      <div className="page-x pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#111]">
          Libraries
        </h1>
        <p className="mt-1 text-[14px] text-neutral-400">
          Collections curated by the community.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-8 border-b border-neutral-100 page-x">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={
              activeTab === tab.key
                ? "border-b-2 border-[#111] pb-3 text-[14px] font-semibold text-[#111]"
                : "pb-3 text-[14px] text-neutral-400 hover:text-neutral-600 transition-colors"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-5 page-x">
        {activeTab === "yours" && (
          <div className="flex flex-col gap-4">
            <Link
              href="/libraries/create"
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 py-10 text-center transition-all hover:border-[#D4A017] hover:bg-amber-50/30"
            >
              <Plus className="h-6 w-6 text-neutral-300" />
              <p className="mt-2 text-[15px] font-semibold text-[#111]">
                New library
              </p>
              <p className="mt-1 text-[13px] text-neutral-400">
                Name it, describe it, then add picks
              </p>
            </Link>

            {myLibraries.map((library) => (
              <LibraryCard
                key={library.id}
                library={library}
                className="w-full"
              />
            ))}
          </div>
        )}

        {activeTab === "explore" && (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={exploreQuery}
                onChange={(e) => setExploreQuery(e.target.value)}
                placeholder="Search libraries, creators, locations…"
                className="h-12 w-full rounded-xl bg-neutral-100 border-0 pl-12 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
              />
            </div>

            {exploreLibraries.length > 0 ? (
              exploreLibraries.map((library) => (
                <LibraryCard
                  key={library.id}
                  library={library}
                  className="w-full"
                />
              ))
            ) : (
              <p className="py-12 text-center text-[14px] text-neutral-400">
                No libraries match &ldquo;{q}&rdquo;. Try a city, neighborhood,
                or curator name.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
