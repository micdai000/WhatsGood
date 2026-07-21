import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  filterFoodLocations,
  formatFoodLocationLabel,
  getFoodRegions,
  type FoodLocation,
} from "@/data/mock";
import { TierBadge } from "./tier-badge";

interface FoodLocationPickerProps {
  locations: FoodLocation[];
  selectedId: string | null;
  onSelect: (location: FoodLocation) => void;
}

export function FoodLocationPicker({
  locations,
  selectedId,
  onSelect,
}: FoodLocationPickerProps) {
  const [query, setQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState("all");

  const regions = useMemo(() => getFoodRegions(locations), [locations]);

  const filtered = useMemo(
    () => filterFoodLocations(locations, query, activeRegion),
    [locations, query, activeRegion],
  );

  const selected = locations.find((entry) => entry.id === selectedId) ?? null;

  return (
    <div className="rounded-2xl border border-border bg-muted p-4">
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-[15px] font-semibold text-foreground">
            Which exact location?
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
            Same chain can differ block to block — pick the address you mean.
          </p>
        </div>
      </div>

      <div className="relative mt-4">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search street, city, or restaurant"
          className="h-11 w-full rounded-xl border-0 bg-white pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border transition-all focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {regions.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            type="button"
            onClick={() => setActiveRegion("all")}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
              activeRegion === "all"
                ? "bg-primary text-white"
                : "bg-white text-muted-foreground ring-1 ring-border",
            )}
          >
            Anywhere
          </button>
          {regions.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => setActiveRegion(region)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
                activeRegion === region
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground ring-1 ring-border",
              )}
            >
              {region}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {filtered.length > 0 ? (
          filtered.map((entry) => {
            const isSelected = entry.id === selectedId;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelect(entry)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition-colors",
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-white ring-1 ring-border hover:bg-muted",
                )}
              >
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate text-[14px] font-semibold",
                      isSelected ? "text-white" : "text-foreground",
                    )}
                  >
                    {entry.restaurant}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 truncate text-[12px] font-medium",
                      isSelected ? "text-white/90" : "text-muted-foreground",
                    )}
                  >
                    {entry.address}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 truncate text-[12px]",
                      isSelected ? "text-white/70" : "text-muted-foreground",
                    )}
                  >
                    {entry.city}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <TierBadge tier={entry.tier} size="sm" />
                  <span
                    className={cn(
                      "text-[13px] font-semibold tabular-nums",
                      isSelected ? "text-white" : "text-foreground",
                    )}
                  >
                    {entry.score > 0 ? "+" : ""}
                    {entry.score}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <p className="py-4 text-center text-[13px] text-muted-foreground">
            No locations match. Try a street name or city.
          </p>
        )}
      </div>

      {selected && (
        <p className="mt-3 text-[12px] text-muted-foreground">
          Showing ratings for{" "}
          <span className="font-medium text-foreground">
            {formatFoodLocationLabel(selected)}
          </span>
        </p>
      )}
    </div>
  );
}
