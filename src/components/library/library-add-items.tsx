import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  allEntities,
  categoryLabels,
  entityMatchesQuery,
  type Category,
  type Entity,
} from "@/data/mock";
import { TierBadge } from "@/components/ui/tier-badge";

interface LibraryAddItemsProps {
  selectedIds: string[];
  onAdd: (entityId: string) => void;
}

const categories: Array<Category | "all"> = [
  "all",
  "food",
  "places",
  "entertainment",
  "movies-shows",
];

export function LibraryAddItems({
  selectedIds,
  onAdd,
}: LibraryAddItemsProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const results = useMemo(() => {
    const q = query.trim();
    return allEntities.filter((entity) => {
      if (selectedSet.has(entity.id)) return false;
      if (category !== "all" && entity.category !== category) return false;
      if (!q) return true;
      return entityMatchesQuery(entity, q);
    });
  }, [category, query, selectedSet]);

  return (
    <div className="rounded-2xl border border-[#D4A017]/30 bg-amber-50/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-[#111]">Add from Meritt</p>
          <p className="mt-0.5 text-[13px] text-neutral-500">
            Only things already on Meritt can go in your library.
          </p>
        </div>
        <Link
          to="/create"
          className="shrink-0 text-[13px] font-semibold text-[#D4A017] hover:underline"
        >
          Add new to Meritt
        </Link>
      </div>

      <div className="relative mt-4">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Meritt…"
          className="h-11 w-full rounded-xl border-0 bg-white pl-10 pr-4 text-[14px] text-[#111] placeholder:text-neutral-400 outline-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-[#D4A017]/30"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
        {categories.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
              category === key
                ? "bg-[#111] text-white"
                : "bg-white text-neutral-500 ring-1 ring-neutral-200",
            )}
          >
            {key === "all" ? "All" : categoryLabels[key]}
          </button>
        ))}
      </div>

      <div className="mt-3 flex max-h-72 flex-col gap-2 overflow-y-auto">
        {results.length > 0 ? (
          results.slice(0, 20).map((entity) => (
            <AddRow key={entity.id} entity={entity} onAdd={() => onAdd(entity.id)} />
          ))
        ) : (
          <p className="py-6 text-center text-[13px] text-neutral-400">
            {query.trim()
              ? "No matches. Try another search or add it to Meritt first."
              : "Everything matching this filter is already in your library."}
          </p>
        )}
      </div>
    </div>
  );
}

function AddRow({
  entity,
  onAdd,
}: {
  entity: Entity;
  onAdd: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-left ring-1 ring-neutral-200 transition-colors hover:bg-neutral-50"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-[#111]">{entity.name}</p>
        <p className="text-[11px] uppercase tracking-wider text-neutral-400">
          {categoryLabels[entity.category]}
        </p>
      </div>
      <TierBadge tier={entity.tier} size="sm" />
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111] text-white">
        <Plus className="h-4 w-4" />
      </span>
    </button>
  );
}
