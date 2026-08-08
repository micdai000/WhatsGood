import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { H3, Muted } from "@/components/typography/typography";
import { brandCopy } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface EmptyResultsProps {
  hasFilters?: boolean;
  className?: string;
}

export function EmptyResults({ hasFilters = false, className }: EmptyResultsProps) {
  return (
    <Card className={cn("border-dashed shadow-none", className)}>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Search className="size-6 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-1">
          <H3 className="text-lg">No professionals found</H3>
          <Muted className="max-w-sm text-sm">
            {hasFilters
              ? "Try a different profession or location, or clear your filters."
              : brandCopy.joiningMessage}
          </Muted>
        </div>
      </CardContent>
    </Card>
  );
}
