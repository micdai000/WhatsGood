import { useNavigate } from "react-router-dom";
import { useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SectionEyebrow } from "@/components/typography/typography";
import { useUrlSyncedState } from "@/hooks/use-url-synced-state";
import { isOtherCategory, sortCategoriesForSelect } from "@/lib/business/categories";
import { buildSearchUrl } from "@/lib/search/params";
import {
  SEARCH_WHAT_LABEL,
  SEARCH_WHERE_LABEL,
} from "@/lib/search/discovery-copy";
import type { ProfileSearchParams, Profession } from "@/types";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  params: ProfileSearchParams;
  professions: Profession[];
  className?: string;
}

export function FilterPanel({ params, professions, className }: FilterPanelProps) {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const [city, setCity] = useUrlSyncedState(params.city);
  const [state, setState] = useUrlSyncedState(params.state);
  const sortedProfessions = sortCategoriesForSelect(professions);
  const listedProfessions = sortedProfessions.filter(
    (profession) => !isOtherCategory(profession),
  );
  const otherProfessions = sortedProfessions.filter((profession) =>
    isOtherCategory(profession),
  );

  function updateFilters(updates: Partial<ProfileSearchParams>) {
    const next: ProfileSearchParams = {
      ...params,
      ...updates,
      page: 1,
    };

    startTransition(() => {
      navigate(buildSearchUrl("/search", next));
    });
  }

  function commitCity() {
    const trimmed = city.trim();
    const current = params.city ?? "";
    if (trimmed !== current) {
      updateFilters({ city: trimmed || undefined });
    }
  }

  function commitState() {
    const trimmed = state.trim();
    const current = params.state ?? "";
    if (trimmed !== current) {
      updateFilters({ state: trimmed || undefined });
    }
  }

  return (
    <div
      className={cn(
        "space-y-6 rounded-xl border bg-card p-5 shadow-sm",
        isPending && "opacity-70",
        className,
      )}
      aria-label="Search filters"
    >
      <div className="space-y-2">
        <SectionEyebrow id="search-what-label">{SEARCH_WHAT_LABEL}</SectionEyebrow>
        <Label htmlFor="profession-filter" className="sr-only">
          {SEARCH_WHAT_LABEL}
        </Label>
        <select
          id="profession-filter"
          name="profession"
          aria-labelledby="search-what-label"
          value={params.professionId ?? ""}
          onChange={(event) =>
            updateFilters({
              professionId: event.target.value || undefined,
            })
          }
          disabled={isPending}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">All categories</option>
          {listedProfessions.map((profession) => (
            <option key={profession.id} value={profession.id}>
              {profession.name}
            </option>
          ))}
          {otherProfessions.length > 0 ? (
            <optgroup label=" ">
              {otherProfessions.map((profession) => (
                <option key={profession.id} value={profession.id}>
                  {profession.name}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
      </div>

      <div className="space-y-3">
        <SectionEyebrow id="search-where-label">{SEARCH_WHERE_LABEL}</SectionEyebrow>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city-filter">City</Label>
            <Input
              id="city-filter"
              name="city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="e.g. Provo"
              disabled={isPending}
              onBlur={commitCity}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitCity();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state-filter">State</Label>
            <Input
              id="state-filter"
              name="state"
              value={state}
              onChange={(event) => setState(event.target.value)}
              placeholder="e.g. UT"
              disabled={isPending}
              onBlur={commitState}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitState();
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
