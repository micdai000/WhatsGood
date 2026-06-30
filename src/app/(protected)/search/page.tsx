"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  allEntities,
  users,
  libraries,
  categoryLabels,
  entityMatchesQuery,
  type Category,
} from "@/data/mock";
import { EntityCard } from "@/components/ui/entity-card";
import { UserCard } from "@/components/ui/user-card";
import { LibraryCard } from "@/components/ui/library-card";
import { SectionHeader } from "@/components/ui/section-header";
import { TierBadge } from "@/components/ui/tier-badge";

type FilterTab =
  | "all"
  | Category
  | "users"
  | "libraries";

const categoryFilters: Category[] = [
  "food",
  "places",
  "entertainment",
  "movies-shows",
];

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  ...categoryFilters.map((key) => ({
    key,
    label: categoryLabels[key],
  })),
  { key: "users", label: "Users" },
  { key: "libraries", label: "Libraries" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const q = query.trim();
  const isBrowsing = !q;

  const browseEntities = useMemo(() => {
    if (activeFilter === "users" || activeFilter === "libraries") return [];

    const pool =
      activeFilter === "all"
        ? allEntities
        : allEntities.filter((e) => e.category === activeFilter);

    return [...pool]
      .sort((a, b) => b.followersCount - a.followersCount)
      .slice(0, activeFilter === "all" ? 6 : 12);
  }, [activeFilter]);

  const browseUsers = useMemo(() => {
    if (activeFilter !== "all" && activeFilter !== "users") return [];
    return [...users].sort((a, b) => b.followers - a.followers);
  }, [activeFilter]);

  const browseLibraries = useMemo(() => {
    if (activeFilter !== "all" && activeFilter !== "libraries") return [];
    return [...libraries].sort((a, b) => b.followerCount - a.followerCount);
  }, [activeFilter]);

  const filteredEntities = useMemo(() => {
    if (!q) return [];

    const byQuery = allEntities.filter((e) => entityMatchesQuery(e, q));

    if (
      activeFilter === "all" ||
      activeFilter === "users" ||
      activeFilter === "libraries"
    ) {
      return byQuery;
    }

    return byQuery.filter((e) => e.category === activeFilter);
  }, [q, activeFilter]);

  const filteredUsers = useMemo(() => {
    if (!q) return [];
    if (activeFilter !== "all" && activeFilter !== "users") return [];

    const normalized = q.toLowerCase();
    return users.filter(
      (u) =>
        u.displayName.toLowerCase().includes(normalized) ||
        u.username.toLowerCase().includes(normalized),
    );
  }, [q, activeFilter]);

  const filteredLibraries = useMemo(() => {
    if (!q) return [];
    if (activeFilter !== "all" && activeFilter !== "libraries") return [];

    const normalized = q.toLowerCase();
    return libraries.filter(
      (l) =>
        l.name.toLowerCase().includes(normalized) ||
        l.description.toLowerCase().includes(normalized),
    );
  }, [q, activeFilter]);

  const hasResults =
    filteredEntities.length > 0 ||
    filteredUsers.length > 0 ||
    filteredLibraries.length > 0;

  const hasBrowseContent =
    browseEntities.length > 0 ||
    browseUsers.length > 0 ||
    browseLibraries.length > 0;

  return (
    <div className="w-full py-6">
      {/* Search bar */}
      <div className="page-x">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search names, addresses, cities…"
            className="h-12 w-full rounded-xl bg-neutral-100 border-0 pl-12 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="mt-3 flex gap-2 overflow-x-auto page-x hide-scrollbar">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              "shrink-0 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors",
              activeFilter === tab.key
                ? "bg-[#111] text-white"
                : "bg-neutral-100 text-neutral-500 hover:text-neutral-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Browse — no query, filter drives content */}
      {isBrowsing && hasBrowseContent && (
        <div className="mt-8 space-y-8 page-x">
          {browseEntities.length > 0 && (
            <div>
              <SectionHeader
                title={
                  activeFilter === "all"
                    ? "Popular Right Now"
                    : activeFilter in categoryLabels
                      ? categoryLabels[activeFilter as keyof typeof categoryLabels]
                      : "Browse"
                }
                subtitle={
                  activeFilter === "all"
                    ? undefined
                    : activeFilter in categoryLabels
                      ? `Top picks in ${categoryLabels[activeFilter as keyof typeof categoryLabels].toLowerCase()}`
                      : undefined
                }
              />
              <div className="tile-grid">
                {browseEntities.map((entity) => (
                  <Link
                    key={entity.id}
                    href={`/entity/${entity.id}`}
                    className="overflow-hidden rounded-xl bg-white"
                  >
                    <div className="tile-media">
                      <Image
                        src={entity.image}
                        alt={entity.name}
                        fill
                        className="object-cover"
                        sizes="50vw"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="text-[13px] font-semibold text-[#111] truncate">
                        {entity.name}
                      </p>
                      <div className="mt-1">
                        <TierBadge tier={entity.tier} size="sm" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {browseUsers.length > 0 && (
            <div>
              <SectionHeader
                title="Creators"
                subtitle={
                  activeFilter === "users"
                    ? "People on Meritt"
                    : undefined
                }
              />
              <div className="flex flex-col gap-2">
                {browseUsers.map((user) => (
                  <UserCard key={user.id} user={user} className="w-full" />
                ))}
              </div>
            </div>
          )}

          {browseLibraries.length > 0 && (
            <div>
              <SectionHeader
                title="Libraries"
                subtitle={
                  activeFilter === "libraries"
                    ? "Curated collections from the community"
                    : undefined
                }
              />
              <div className="flex flex-col gap-3">
                {browseLibraries.map((library) => (
                  <LibraryCard
                    key={library.id}
                    library={library}
                    className="w-full"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search results */}
      {q && hasResults && (
        <div className="mt-6 space-y-8 page-x">
          {filteredEntities.length > 0 && (
            <div>
              <SectionHeader title="Entities" />
              <div className="flex flex-col gap-2">
                {filteredEntities.map((entity) => (
                  <EntityCard key={entity.id} entity={entity} size="small" />
                ))}
              </div>
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div>
              <SectionHeader title="People" />
              <div className="flex flex-col gap-2">
                {filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} className="w-full" />
                ))}
              </div>
            </div>
          )}

          {filteredLibraries.length > 0 && (
            <div>
              <SectionHeader title="Libraries" />
              <div className="flex flex-col gap-3">
                {filteredLibraries.map((library) => (
                  <LibraryCard
                    key={library.id}
                    library={library}
                    className="w-full"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {q && !hasResults && (
        <div className="py-20 text-center page-x">
          <p className="text-lg font-bold text-neutral-300">No results</p>
          <p className="mt-1 text-[14px] text-neutral-300">
            Try a different name, address, or city
          </p>
        </div>
      )}
    </div>
  );
}
