"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TierBadge } from "./tier-badge";
import { formatCount, categoryLabels, formatFoodLocationLabel, type Entity } from "@/data/mock";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface EntityCardProps {
  entity: Entity;
  size?: "small" | "large";
  className?: string;
}

export function EntityCard({ entity, size = "small", className }: EntityCardProps) {
  const isFood = entity.category === "food";
  const foodLocations = entity.foodLocations ?? [];
  const singleFoodLocation =
    isFood && foodLocations.length === 1 ? foodLocations[0] : null;

  if (size === "large") {
    return (
      <Link
        href={`/entity/${entity.id}`}
        className={cn("card-row-item", className)}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
          <Image
            src={entity.image}
            alt={entity.name}
            fill
            className="object-cover"
            sizes="220px"
            loading="lazy"
          />
          <div className="absolute bottom-3 left-3">
            {singleFoodLocation ? (
              <TierBadge tier={singleFoodLocation.tier} size="sm" />
            ) : !isFood ? (
              <TierBadge tier={entity.tier} size="sm" />
            ) : null}
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-base font-semibold text-[#111] leading-snug truncate">
            {entity.name}
          </h3>
          {entity.category === "food" && entity.foodLocations && (
            <p className="text-[12px] text-neutral-400 mt-0.5 truncate">
              {entity.foodLocations.length > 1
                ? `${entity.foodLocations.length} addresses`
                : formatFoodLocationLabel(entity.foodLocations[0])}
            </p>
          )}
          <div className="mt-0.5 flex items-center gap-1.5 text-sm tabular-nums text-neutral-400">
            {singleFoodLocation ? (
              <>
                <span>
                  {singleFoodLocation.score > 0 ? "+" : ""}
                  {singleFoodLocation.score}
                </span>
                {singleFoodLocation.trending === "up" && (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                )}
                {singleFoodLocation.trending === "down" && (
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                )}
                <span className="text-neutral-300">&middot;</span>
                <span>{formatCount(singleFoodLocation.totalVotes)} votes</span>
              </>
            ) : isFood ? (
              <span>Rated by location</span>
            ) : (
              <>
                <span>{entity.score > 0 ? "+" : ""}{entity.score}</span>
                {entity.trending === "up" && (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                )}
                {entity.trending === "down" && (
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                )}
                <span className="text-neutral-300">&middot;</span>
                <span>{formatCount(entity.totalVotes)} votes</span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/entity/${entity.id}`}
      className={cn(
        "flex rounded-2xl bg-white p-2.5 gap-3.5 hover:bg-neutral-50 transition-colors",
        className,
      )}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={entity.image}
          alt={entity.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="text-[11px] uppercase tracking-widest text-neutral-400 font-medium">
          {categoryLabels[entity.category]}
        </p>
        <h3 className="text-[15px] font-semibold text-[#111] leading-snug mt-0.5 truncate">
          {entity.name}
        </h3>
        {entity.category === "food" && entity.foodLocations && (
          <p className="text-[12px] text-neutral-400 mt-0.5 truncate">
            {entity.foodLocations.length > 1
              ? `${entity.foodLocations.length} addresses · tap to compare`
              : formatFoodLocationLabel(entity.foodLocations[0])}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          {singleFoodLocation ? (
            <>
              <TierBadge tier={singleFoodLocation.tier} size="sm" />
              <span className="text-sm tabular-nums text-neutral-400">
                {singleFoodLocation.score > 0 ? "+" : ""}
                {singleFoodLocation.score}
              </span>
              {singleFoodLocation.trending === "up" && (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              )}
              {singleFoodLocation.trending === "down" && (
                <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              )}
            </>
          ) : isFood ? (
            <span className="text-[12px] font-medium text-[#D4A017]">
              Compare by location
            </span>
          ) : (
            <>
              <TierBadge tier={entity.tier} size="sm" />
              <span className="text-sm tabular-nums text-neutral-400">
                {entity.score > 0 ? "+" : ""}{entity.score}
              </span>
              {entity.trending === "up" && (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              )}
              {entity.trending === "down" && (
                <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              )}
            </>
          )}
        </div>
        {!isFood && (
          <p className="text-[12px] text-neutral-400 mt-0.5">
            {formatCount(entity.followersCount)} followers
          </p>
        )}
      </div>
    </Link>
  );
}
