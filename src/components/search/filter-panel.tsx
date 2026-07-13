import { useNavigate } from "react-router-dom";
import { useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUrlSyncedState } from "@/hooks/use-url-synced-state";
import { buildSearchUrl } from "@/lib/search/params";
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
        "grid gap-4 rounded-xl border bg-card p-4 shadow-sm sm:grid-cols-3",
        isPending && "opacity-70",
        className,
      )}
    >
      <div className="space-y-2 sm:col-span-3">
        <Label htmlFor="profession-filter">Profession</Label>
        <select
          id="profession-filter"
          name="profession"
          value={params.professionId ?? ""}
          onChange={(event) =>
            updateFilters({
              professionId: event.target.value || undefined,
            })
          }
          disabled={isPending}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">All professions</option>
          {professions.map((profession) => (
            <option key={profession.id} value={profession.id}>
              {profession.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city-filter">City</Label>
        <Input
          id="city-filter"
          name="city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="e.g. Austin"
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
          placeholder="e.g. TX"
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
  );
}
