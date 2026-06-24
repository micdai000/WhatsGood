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

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "food", label: "Food" },
  { key: "places", label: "Places" },
  { key: "entertainment", label: "Entertainment" },
  { key: "movies-shows", label: "Movies / Shows" },
  { key: "users", label: "Users" },
  { key: "libraries", label: "Libraries" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const q = query.toLowerCase().trim();

  const popularEntities = useMemo(
    () => [...allEntities].sort((a, b) => b.followersCount - a.followersCount).slice(0, 6),
    [],
  );

  const filteredEntities = useMemo(() => {
    if (!q) return [];
    const byQuery = allEntities.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q),
    );
    if (activeFilter === "all" || activeFilter === "users" || activeFilter === "libraries")
      return byQuery;
    return byQuery.filter((e) => e.category === activeFilter);
  }, [q, activeFilter]);

  const filteredUsers = useMemo(() => {
    if (!q) return [];
    if (
      activeFilter !== "all" &&
      activeFilter !== "users"
    )
      return [];
    return users.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    );
  }, [q, activeFilter]);

  const filteredLibraries = useMemo(() => {
    if (!q) return [];
    if (
      activeFilter !== "all" &&
      activeFilter !== "libraries"
    )
      return [];
    return libraries.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q),
    );
  }, [q, activeFilter]);

  const hasResults =
    filteredEntities.length > 0 ||
    filteredUsers.length > 0 ||
    filteredLibraries.length > 0;

  return (
    <div className="py-6">
      {/* Search bar */}
      <div className="px-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            className="h-12 w-full rounded-xl bg-neutral-100 border-0 pl-12 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-5 hide-scrollbar">
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

      {/* Empty state — no query */}
      {!q && (
        <>
          <h2 className="mt-8 px-5 text-lg font-bold text-[#111]">
            Popular Right Now
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 px-5">
            {popularEntities.map((entity) => (
              <Link
                key={entity.id}
                href={`/entity/${entity.id}`}
                className="overflow-hidden rounded-xl bg-white"
              >
                <div className="relative h-[140px]">
                  <Image
                    src={entity.image}
                    alt={entity.name}
                    fill
                    className="object-cover"
                    sizes="50vw"
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

          <h2 className="mt-8 px-5 text-lg font-bold text-[#111]">Creators</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto px-5 hide-scrollbar">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </>
      )}

      {/* Search results */}
      {q && hasResults && (
        <div className="mt-6 space-y-8 px-5">
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
        <div className="py-20 text-center">
          <p className="text-lg font-bold text-neutral-300">No results</p>
          <p className="mt-1 text-[14px] text-neutral-300">
            Try searching for something else
          </p>
        </div>
      )}
    </div>
  );
}
