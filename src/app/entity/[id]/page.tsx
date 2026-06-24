"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Users, Bookmark, Heart, TrendingUp, TrendingDown, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { allEntities, libraries, categoryLabels, formatCount, userVotes, followedEntityIds } from "@/data/mock";
import { TierBadge } from "@/components/ui/tier-badge";
import { VoteButtons } from "@/components/ui/vote-buttons";
import { LibraryCard } from "@/components/ui/library-card";
import { SectionHeader } from "@/components/ui/section-header";

export default function EntityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const entity = allEntities.find((e) => e.id === id);

  const [following, setFollowing] = useState(
    () => !!entity && followedEntityIds.includes(entity.id),
  );

  if (!entity) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#111]">Not found</h1>
          <p className="mt-2 text-[14px] text-neutral-400">
            This page doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-[14px] font-semibold text-[#D4A017]"
          >
            Go back
          </Link>
        </div>
      </div>
    );
  }

  const includedInLibraries = libraries.filter((lib) =>
    lib.entityIds.includes(entity.id),
  );
  const currentVote =
    userVotes.find((v) => v.entityId === entity.id)?.voteType ?? null;

  return (
    <div className="pb-28">
      {/* Cinematic hero image */}
      <div className="relative h-[340px] lg:h-[420px] overflow-hidden">
        <Image
          src={entity.image}
          alt={entity.name}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <Link
          href="/"
          className="absolute top-5 left-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
        >
          <ChevronLeft className="h-5 w-5 text-[#111]" />
        </Link>
        <button className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm">
          <Share2 className="h-5 w-5 text-[#111]" />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 pt-6">
        {/* Category + Tier */}
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4A017]">
            {categoryLabels[entity.category]}
          </span>
          <TierBadge tier={entity.tier} size="md" />
        </div>

        {/* Name */}
        <h1 className="mt-2 text-[28px] lg:text-3xl font-bold leading-tight tracking-tight text-[#111]">
          {entity.name}
        </h1>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tabular-nums text-[#111]">
              {entity.score > 0 ? "+" : ""}
              {entity.score}
            </span>
            {entity.trending === "up" && (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            )}
            {entity.trending === "down" && (
              <TrendingDown className="h-5 w-5 text-red-400" />
            )}
          </div>
          <div className="h-5 w-px bg-neutral-200" />
          <span className="text-[14px] text-neutral-400">
            {formatCount(entity.totalVotes)} votes
          </span>
          <div className="h-5 w-px bg-neutral-200" />
          <span className="flex items-center gap-1.5 text-[14px] text-neutral-400">
            <Users className="h-4 w-4" />
            {formatCount(entity.followersCount)} followers
          </span>
        </div>

        {/* Description */}
        <p className="mt-5 text-[16px] lg:text-[17px] leading-relaxed text-neutral-600">
          {entity.description}
        </p>

        {/* Action buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setFollowing((f) => !f)}
            className={cn(
              "flex-1 rounded-xl py-3.5 text-[15px] font-semibold transition-colors",
              following
                ? "bg-neutral-100 text-neutral-600"
                : "bg-[#111] text-white hover:bg-neutral-800",
            )}
          >
            {following ? "Following" : "Follow"}
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3.5 text-[15px] font-semibold text-[#111] hover:bg-neutral-50 transition-colors">
            <Bookmark className="h-4 w-4" />
            Save
          </button>
        </div>

        {/* Vote section */}
        <div className="mt-10">
          <SectionHeader
            title="Cast Your Vote"
            subtitle="Help the community decide where this belongs"
          />
          <VoteButtons entityId={entity.id} currentVote={currentVote} />
        </div>

        {/* Included In Libraries */}
        <div className="mt-10 mb-8">
          <SectionHeader title="Included In" />
          {includedInLibraries.length > 0 ? (
            <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2">
              {includedInLibraries.map((lib) => (
                <LibraryCard key={lib.id} library={lib} />
              ))}
            </div>
          ) : (
            <p className="py-6 text-[14px] text-neutral-300">
              No one has added this to a library yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
