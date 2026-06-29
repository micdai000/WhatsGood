"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { currentUser, libraries } from "@/data/mock";
import { LibraryCard } from "@/components/ui/library-card";

type LibraryTab = "yours" | "explore";

export default function LibrariesPage() {
  const [activeTab, setActiveTab] = useState<LibraryTab>("yours");

  const myLibraries = libraries.filter(
    (l) => l.creator.id === currentUser.id,
  );

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
              href="/create"
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 py-10 text-center transition-all hover:border-[#D4A017] hover:bg-amber-50/30"
            >
              <Plus className="h-6 w-6 text-neutral-300" />
              <p className="mt-2 text-[14px] text-neutral-400">
                Create a library
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
            {libraries.map((library) => (
              <LibraryCard
                key={library.id}
                library={library}
                className="w-full"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
