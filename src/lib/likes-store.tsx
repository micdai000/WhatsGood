"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedLikedEntityIds } from "@/data/mock";

const STORAGE_KEY = "meritt-liked-entities";

interface LikesContextValue {
  likedEntityIds: string[];
  isLiked: (entityId: string) => boolean;
  toggleLike: (entityId: string) => void;
  hydrated: boolean;
}

const LikesContext = createContext<LikesContextValue | null>(null);

function loadLikedIds(): string[] {
  if (typeof window === "undefined") return [...seedLikedEntityIds];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...seedLikedEntityIds];
    return JSON.parse(raw) as string[];
  } catch {
    return [...seedLikedEntityIds];
  }
}

function saveLikedIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function LikesProvider({ children }: { children: ReactNode }) {
  const [likedEntityIds, setLikedEntityIds] = useState<string[]>([
    ...seedLikedEntityIds,
  ]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLikedEntityIds(loadLikedIds());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveLikedIds(likedEntityIds);
  }, [likedEntityIds, hydrated]);

  const isLiked = useCallback(
    (entityId: string) => likedEntityIds.includes(entityId),
    [likedEntityIds],
  );

  const toggleLike = useCallback((entityId: string) => {
    setLikedEntityIds((prev) =>
      prev.includes(entityId)
        ? prev.filter((id) => id !== entityId)
        : [...prev, entityId],
    );
  }, []);

  const value = useMemo(
    () => ({ likedEntityIds, isLiked, toggleLike, hydrated }),
    [likedEntityIds, isLiked, toggleLike, hydrated],
  );

  return (
    <LikesContext.Provider value={value}>{children}</LikesContext.Provider>
  );
}

export function useLikes() {
  const ctx = useContext(LikesContext);
  if (!ctx) {
    throw new Error("useLikes must be used within LikesProvider");
  }
  return ctx;
}
