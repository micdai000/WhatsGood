"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Heart, TrendingUp, TrendingDown, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  allEntities,
  categoryLabels,
  formatCount,
  userVotes,
  formatFoodLocationLabel,
  type FoodLocation,
} from "@/data/mock";
import { useLibraries } from "@/lib/libraries-store";
import { useLikes } from "@/lib/likes-store";
import { TierBadge } from "@/components/ui/tier-badge";
import { VoteButtons } from "@/components/ui/vote-buttons";
import { LibraryCard } from "@/components/ui/library-card";
import { SectionHeader } from "@/components/ui/section-header";
import { FoodLocationPicker } from "@/components/ui/food-location-picker";

export default function EntityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { libraries } = useLibraries();
  const { isLiked, toggleLike } = useLikes();
  const entity = allEntities.find((e) => e.id === id);

  const liked = entity ? isLiked(entity.id) : false;
  const [selectedFoodLocation, setSelectedFoodLocation] =
    useState<FoodLocation | null>(null);

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

  const isFood = entity.category === "food";
  const foodLocations = entity.foodLocations ?? [];
  const activeLocation = isFood ? selectedFoodLocation : null;

  const displayScore = activeLocation?.score ?? entity.score;
  const displayTier = activeLocation?.tier ?? entity.tier;
  const displayVotes = activeLocation?.totalVotes ?? entity.totalVotes;
  const displayTrending = activeLocation?.trending ?? entity.trending;

  const includedInLibraries = libraries.filter((lib) =>
    lib.entityIds.includes(entity.id),
  );

  const currentVote =
    !isFood || activeLocation
      ? userVotes.find(
          (v) =>
            v.entityId === entity.id &&
            (!isFood ||
              !v.foodLocationId ||
              v.foodLocationId === activeLocation?.id),
        )?.voteType ?? null
      : null;

  return (
    <div className="w-full pb-28">
      {/* Cinematic hero image */}
      <div className="entity-hero">
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
      <div className="page-x pt-6">
        {/* Category + Tier */}
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4A017]">
            {categoryLabels[entity.category]}
          </span>
          {(!isFood || activeLocation) && (
            <TierBadge tier={displayTier} size="md" />
          )}
        </div>

        {/* Name */}
        <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-[#111] sm:text-3xl">
          {entity.name}
        </h1>

        {isFood && activeLocation && (
          <p className="mt-2 text-[14px] text-neutral-500">
            {formatFoodLocationLabel(activeLocation)}
          </p>
        )}

        {/* Food location picker */}
        {isFood && foodLocations.length > 0 && (
          <div className="mt-5">
            <FoodLocationPicker
              locations={foodLocations}
              selectedId={selectedFoodLocation?.id ?? null}
              onSelect={setSelectedFoodLocation}
            />
          </div>
        )}

        {/* Stats row */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-4",
            isFood ? "mt-5" : "mt-4",
          )}
        >
          {isFood && !activeLocation ? (
            <p className="text-[14px] text-neutral-400">
              Pick a location above to see local ratings
            </p>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tabular-nums text-[#111]">
                  {displayScore > 0 ? "+" : ""}
                  {displayScore}
                </span>
                {displayTrending === "up" && (
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                )}
                {displayTrending === "down" && (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="h-5 w-px bg-neutral-200" />
              <span className="text-[14px] text-neutral-400">
                {formatCount(displayVotes)} votes
                {isFood && activeLocation ? " at this spot" : ""}
              </span>
              {!isFood && (
                <>
                  <div className="h-5 w-px bg-neutral-200" />
                  <span className="flex items-center gap-1.5 text-[14px] text-neutral-400">
                    <Heart className="h-4 w-4" />
                    {formatCount(entity.followersCount)} likes
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => entity && toggleLike(entity.id)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold transition-colors",
              liked
                ? "bg-red-50 text-red-500 ring-1 ring-red-100"
                : "bg-[#111] text-white hover:bg-neutral-800",
            )}
          >
            <Heart
              className={cn("h-[18px] w-[18px]", liked && "fill-current")}
              strokeWidth={2}
            />
            {liked ? "Liked" : "Like"}
          </button>
        </div>

        {/* Vote section */}
        <div className="mt-10">
          <SectionHeader
            title="Cast Your Vote"
            subtitle={
              isFood
                ? activeLocation
                  ? `Rate it at ${activeLocation.address}, ${activeLocation.city}`
                  : "Select the exact address to vote"
                : "Help the community decide where this belongs"
            }
          />
          {isFood && !activeLocation ? (
            <p className="rounded-xl bg-neutral-50 py-6 text-center text-[14px] text-neutral-400">
              Choose where you tried this before voting.
            </p>
          ) : (
            <VoteButtons entityId={entity.id} currentVote={currentVote} />
          )}
        </div>

        {/* Included In Libraries */}
        <div className="mt-10 mb-8">
          <SectionHeader title="Included In" />
          {includedInLibraries.length > 0 ? (
            <div className="card-row card-row--wide hide-scrollbar">
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
