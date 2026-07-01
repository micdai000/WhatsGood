import { SearchResultCard } from "@/components/search/search-result-card";
import type { PublicProfile } from "@/types";
import { cn } from "@/lib/utils";

interface ResultsGridProps {
  profiles: PublicProfile[];
  className?: string;
}

export function ResultsGrid({ profiles, className }: ResultsGridProps) {
  return (
    <ul
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {profiles.map((profile) => (
        <li key={profile.username} className="min-h-0">
          <SearchResultCard profile={profile} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
