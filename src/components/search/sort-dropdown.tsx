import { useNavigate } from "react-router-dom";
import { useTransition } from "react";
import { Label } from "@/components/ui/label";
import { buildSearchUrl } from "@/lib/search/params";
import { PROFILE_SORT_ORDERS, type ProfileSearchParams } from "@/types";
import { cn } from "@/lib/utils";

const SORT_LABELS: Record<(typeof PROFILE_SORT_ORDERS)[number], string> = {
  newest: "Newest",
  rating: "Highest rated",
  reviews: "Most reviews",
  name: "Name (A–Z)",
};

interface SortDropdownProps {
  params: ProfileSearchParams;
  className?: string;
}

export function SortDropdown({ params, className }: SortDropdownProps) {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const sort = event.target.value as ProfileSearchParams["sort"];
    startTransition(() => {
      navigate(
        buildSearchUrl("/search", {
          ...params,
          sort,
          page: 1,
        }),
      );
    });
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Label htmlFor="sort" className="shrink-0 text-sm text-muted-foreground">
        Sort by
      </Label>
      <select
        id="sort"
        name="sort"
        value={params.sort ?? "newest"}
        onChange={handleChange}
        disabled={isPending}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        {PROFILE_SORT_ORDERS.map((order) => (
          <option key={order} value={order}>
            {SORT_LABELS[order]}
          </option>
        ))}
      </select>
    </div>
  );
}
