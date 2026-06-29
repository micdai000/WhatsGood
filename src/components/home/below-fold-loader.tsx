"use client";

import dynamic from "next/dynamic";
import type { Entity, Library } from "@/data/mock";
import { BelowFoldSkeleton } from "./below-fold-skeleton";

const BelowFoldSections = dynamic(
  () =>
    import("./below-fold-sections").then((m) => m.BelowFoldSections),
  { loading: () => <BelowFoldSkeleton />, ssr: false },
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
  return <BelowFoldSections {...props} />;
}
