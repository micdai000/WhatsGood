"use client";

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
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D4A017]" />
        <div>
          <p className="text-[15px] font-semibold text-[#111]">
            Which exact location?
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-neutral-500">
            Same chain can differ block to block — pick the address you mean.
          </p>
        </div>
      </div>

      <div className="relative mt-4">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search street, city, or restaurant"
          className="h-11 w-full rounded-xl border-0 bg-white pl-10 pr-4 text-[14px] text-[#111] placeholder:text-neutral-400 outline-none ring-1 ring-neutral-200 transition-all focus:ring-2 focus:ring-[#D4A017]/30"
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
                ? "bg-[#111] text-white"
                : "bg-white text-neutral-500 ring-1 ring-neutral-200",
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
                  ? "bg-[#111] text-white"
                  : "bg-white text-neutral-500 ring-1 ring-neutral-200",
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
                    ? "bg-[#111] text-white"
                    : "bg-white ring-1 ring-neutral-200 hover:bg-neutral-50",
                )}
              >
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate text-[14px] font-semibold",
                      isSelected ? "text-white" : "text-[#111]",
                    )}
                  >
                    {entry.restaurant}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 truncate text-[12px] font-medium",
                      isSelected ? "text-white/90" : "text-neutral-600",
                    )}
                  >
                    {entry.address}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 truncate text-[12px]",
                      isSelected ? "text-white/70" : "text-neutral-400",
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
                      isSelected ? "text-white" : "text-[#111]",
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
          <p className="py-4 text-center text-[13px] text-neutral-400">
            No locations match. Try a street name or city.
          </p>
        )}
      </div>

      {selected && (
        <p className="mt-3 text-[12px] text-neutral-500">
          Showing ratings for{" "}
          <span className="font-medium text-[#111]">
            {formatFoodLocationLabel(selected)}
          </span>
        </p>
      )}
    </div>
  );
}
