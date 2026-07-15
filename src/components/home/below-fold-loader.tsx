import { lazy, Suspense } from "react";
import type { Entity, Library } from "@/data/mock";
import { BelowFoldSkeleton } from "./below-fold-skeleton";

const BelowFoldSections = lazy(() =>
  import("./below-fold-sections").then((m) => ({ default: m.BelowFoldSections })),
);

interface BelowFoldLoaderProps {
  eliteEntities: Entity[];
  trendingUpEntities: Entity[];
  mostFollowedEntities: Entity[];
  homeLibraries: Library[];
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
