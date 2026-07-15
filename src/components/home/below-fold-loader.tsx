import { lazy, Suspense } from "react";
import type { Entity } from "@/data/mock";
import { BelowFoldSkeleton } from "./below-fold-skeleton";

const BelowFoldSections = lazy(() =>
  import("./below-fold-sections").then((m) => ({ default: m.BelowFoldSections })),
);

interface BelowFoldLoaderProps {
  eliteEntities: Entity[];
  trendingUpEntities: Entity[];
  mostFollowedEntities: Entity[];
  trendingDownEntities: Entity[];
  recentlyAddedEntities: Entity[];
}

export function BelowFoldLoader(props: BelowFoldLoaderProps) {
  return (
    <Suspense fallback={<BelowFoldSkeleton />}>
      <BelowFoldSections {...props} />
    </Suspense>
  );
}
