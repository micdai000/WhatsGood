import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingResultsProps {
  count?: number;
  className?: string;
}

export function LoadingResults({ count = 6, className }: LoadingResultsProps) {
  return (
    <ul
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      aria-busy="true"
      aria-label="Loading search results"
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <div className="overflow-hidden rounded-xl border">
            <Skeleton className="h-12 w-full rounded-none" />
            <div className="space-y-3 p-4">
              <div className="flex gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
