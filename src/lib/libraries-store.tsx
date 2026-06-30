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
import {
  currentUser,
  libraries as seedLibraries,
  type Library,
} from "@/data/mock";

const STORAGE_KEY = "meritt-user-libraries";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop";

export interface CreateLibraryInput {
  name: string;
  description: string;
  coverImage?: string;
  isPublic: boolean;
  isLocationBased?: boolean;
  location?: string;
}

interface LibrariesContextValue {
  libraries: Library[];
  getLibrary: (id: string) => Library | undefined;
  createLibrary: (input: CreateLibraryInput) => Library;
  addEntityToLibrary: (libraryId: string, entityId: string) => boolean;
  removeEntityFromLibrary: (libraryId: string, entityId: string) => boolean;
  isLibraryOwner: (library: Library) => boolean;
}

const LibrariesContext = createContext<LibrariesContextValue | null>(null);

function loadUserLibraries(): Library[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Library[];
  } catch {
    return [];
  }
}

function saveUserLibraries(libraries: Library[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(libraries));
}

function syncLibraryCounts(library: Library): Library {
  return {
    ...library,
    entityCount: library.entityIds.length,
  };
}

function mergeLibraries(userLibraries: Library[]): Library[] {
  const byId = new Map(seedLibraries.map((library) => [library.id, library]));
  for (const library of userLibraries) {
    byId.set(library.id, library);
  }
  return Array.from(byId.values());
}

export function LibrariesProvider({ children }: { children: ReactNode }) {
  const [userLibraries, setUserLibraries] = useState<Library[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUserLibraries(loadUserLibraries());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveUserLibraries(userLibraries);
    }
  }, [userLibraries, hydrated]);

  const libraries = useMemo(
    () => mergeLibraries(userLibraries),
    [userLibraries],
  );

  const getLibrary = useCallback(
    (id: string) => libraries.find((library) => library.id === id),
    [libraries],
  );

  const isLibraryOwner = useCallback(
    (library: Library) => library.creator.id === currentUser.id,
    [],
  );

  const mutateOwnedLibrary = useCallback(
    (
      libraryId: string,
      updater: (library: Library) => Library,
    ): boolean => {
      const source = getLibrary(libraryId);
      if (!source || !isLibraryOwner(source)) return false;

      setUserLibraries((prev) => {
        const existing = prev.find((library) => library.id === libraryId);
        if (existing) {
          return prev.map((library) =>
            library.id === libraryId
              ? syncLibraryCounts(updater(library))
              : library,
          );
        }
        return [...prev, syncLibraryCounts(updater({ ...source }))];
      });

      return true;
    },
    [getLibrary, isLibraryOwner],
  );

  const createLibrary = useCallback((input: CreateLibraryInput): Library => {
    const isLocationBased = !!input.isLocationBased;
    const location = isLocationBased ? input.location?.trim() : undefined;

    const library: Library = syncLibraryCounts({
      id: `ul-${Date.now()}`,
      name: input.name.trim(),
      description: input.description.trim(),
      coverImage: input.coverImage?.trim() || DEFAULT_COVER,
      entityCount: 0,
      followerCount: 0,
      creator: currentUser,
      entityIds: [],
      isPublic: input.isPublic,
      ...(isLocationBased && location
        ? { isLocationBased: true, location }
        : {}),
    });

    setUserLibraries((prev) => [...prev, library]);
    return library;
  }, []);

  const addEntityToLibrary = useCallback(
    (libraryId: string, entityId: string): boolean => {
      const library = getLibrary(libraryId);
      if (!library || library.entityIds.includes(entityId)) return false;

      return mutateOwnedLibrary(libraryId, (entry) => ({
        ...entry,
        entityIds: [...entry.entityIds, entityId],
      }));
    },
    [getLibrary, mutateOwnedLibrary],
  );

  const removeEntityFromLibrary = useCallback(
    (libraryId: string, entityId: string): boolean => {
      return mutateOwnedLibrary(libraryId, (entry) => ({
        ...entry,
        entityIds: entry.entityIds.filter((id) => id !== entityId),
      }));
    },
    [mutateOwnedLibrary],
  );

  const value = useMemo(
    () => ({
      libraries,
      getLibrary,
      createLibrary,
      addEntityToLibrary,
      removeEntityFromLibrary,
      isLibraryOwner,
    }),
    [
      libraries,
      getLibrary,
      createLibrary,
      addEntityToLibrary,
      removeEntityFromLibrary,
      isLibraryOwner,
    ],
  );

  return (
    <LibrariesContext.Provider value={value}>{children}</LibrariesContext.Provider>
  );
}

export function useLibraries() {
  const context = useContext(LibrariesContext);
  if (!context) {
    throw new Error("useLibraries must be used within LibrariesProvider");
  }
  return context;
}
