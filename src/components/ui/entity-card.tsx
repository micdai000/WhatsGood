import { Link } from "react-router-dom";
import { AppImage } from "@/components/ui/app-image";
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
        to={`/entity/${entity.id}`}
        className={cn("card-row-item", className)}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.5rem] border border-border">
          <AppImage
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
          <h3 className="truncate text-base font-semibold leading-snug text-foreground">
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
      to={`/entity/${entity.id}`}
      className={cn(
        "meritt-panel flex gap-3.5 p-2.5 transition-colors hover:bg-white",
        className,
      )}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border">
        <AppImage
          src={entity.image}
          alt={entity.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {categoryLabels[entity.category]}
        </p>
        <h3 className="mt-0.5 truncate text-[15px] font-semibold leading-snug text-foreground">
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
