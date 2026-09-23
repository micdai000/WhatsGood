import { SearchResultCard } from "@/components/search/search-result-card";
import type { DiscoverableBusiness } from "@/types";
import { cn } from "@/lib/utils";

interface ResultsGridProps {
  businesses: DiscoverableBusiness[];
  className?: string;
}

export function ResultsGrid({ businesses, className }: ResultsGridProps) {
  return (
    <ul
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {businesses.map((business) => (
        <li key={business.id} className="min-h-0">
          <SearchResultCard business={business} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
