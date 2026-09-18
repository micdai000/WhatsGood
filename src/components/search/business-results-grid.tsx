import { BusinessResultCard } from "@/components/search/business-result-card";
import type { DiscoverableBusiness } from "@/types";
import { cn } from "@/lib/utils";

interface BusinessResultsGridProps {
  businesses: DiscoverableBusiness[];
  className?: string;
}

export function BusinessResultsGrid({
  businesses,
  className,
}: BusinessResultsGridProps) {
  return (
    <ul
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {businesses.map((business) => (
        <li key={business.id} className="min-h-0">
          <BusinessResultCard business={business} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
