"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Share2, Users, X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { allEntities, formatCount } from "@/data/mock";
import { useLibraries } from "@/lib/libraries-store";
import { Avatar } from "@/components/ui/avatar";
import { EntityCard } from "@/components/ui/entity-card";
import { SectionHeader } from "@/components/ui/section-header";
import { LibraryAddItems } from "@/components/library/library-add-items";

export default function LibraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";

  const {
    getLibrary,
    isLibraryOwner,
    addEntityToLibrary,
    removeEntityFromLibrary,
  } = useLibraries();

  const library = getLibrary(id);
  const [following, setFollowing] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(isNew);

  const owner = library ? isLibraryOwner(library) : false;

  const entities = useMemo(() => {
    if (!library) return [];
    return library.entityIds
      .map((entityId) => allEntities.find((e) => e.id === entityId))
      .filter((e): e is NonNullable<typeof e> => !!e);
  }, [library]);

  if (!library) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#111]">Not found</h1>
          <p className="mt-2 text-[14px] text-neutral-400">
            This library doesn&apos;t exist.
          </p>
          <Link
            href="/libraries"
            className="mt-4 inline-block text-[14px] font-semibold text-[#D4A017]"
          >
            Back to libraries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-28">
      <div className="entity-hero">
        <Image
          src={library.coverImage}
          alt={library.name}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <Link
          href="/libraries"
          className="absolute top-5 left-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
        >
          <ChevronLeft className="h-5 w-5 text-[#111]" />
        </Link>
        <button
          type="button"
          className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
        >
          <Share2 className="h-5 w-5 text-[#111]" />
        </button>
        <div className="absolute inset-x-0 bottom-0 z-10 page-x pb-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#D4A017]">
            Library
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-white sm:text-3xl">
            {library.name}
          </h1>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-white/85">
            {library.description}
          </p>
          {library.isLocationBased && library.location && (
            <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-white/90">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {library.location}
            </p>
          )}
        </div>
      </div>

      <div className="page-x pt-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <Avatar
              src={library.creator.avatar}
              alt={library.creator.displayName}
              size={36}
            />
            <div>
              <p className="text-[13px] font-semibold text-[#111]">
                {library.creator.displayName}
              </p>
              <p className="text-[12px] text-neutral-400">Curator</p>
            </div>
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <span className="flex items-center gap-1.5 text-[14px] text-neutral-500">
            <Users className="h-4 w-4" />
            {formatCount(library.followerCount)} followers
          </span>
          <div className="h-8 w-px bg-neutral-200" />
          <span className="text-[14px] text-neutral-500">
            {entities.length} in this collection
          </span>
        </div>

        {owner ? (
          <div className="mt-6 space-y-4">
            {!showAddPanel && (
              <button
                type="button"
                onClick={() => setShowAddPanel(true)}
                className="w-full rounded-xl bg-[#111] py-3.5 text-[15px] font-semibold text-white hover:bg-neutral-800"
              >
                Add items from Meritt
              </button>
            )}
            {showAddPanel && (
              <LibraryAddItems
                selectedIds={library.entityIds}
                onAdd={(entityId) => addEntityToLibrary(library.id, entityId)}
              />
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setFollowing((f) => !f)}
            className={cn(
              "mt-6 w-full rounded-xl py-3.5 text-[15px] font-semibold transition-colors",
              following
                ? "bg-neutral-100 text-neutral-600"
                : "bg-[#111] text-white hover:bg-neutral-800",
            )}
          >
            {following ? "Following" : "Follow library"}
          </button>
        )}

        <div className="mt-10">
          <SectionHeader
            title="Inside this library"
            subtitle={
              owner
                ? "Your picks — only you can change this list"
                : `${entities.length} picks from the community`
            }
          />
          {entities.length > 0 ? (
            <div className="flex flex-col gap-2">
              {entities.map((entity) => (
                <div key={entity.id} className="relative">
                  <EntityCard entity={entity} size="small" />
                  {owner && (
                    <button
                      type="button"
                      onClick={() =>
                        removeEntityFromLibrary(library.id, entity.id)
                      }
                      className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm ring-1 ring-neutral-200 hover:text-red-500"
                      aria-label={`Remove ${entity.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-[14px] text-neutral-400">
              {owner
                ? "No items yet. Search above to add things from Meritt."
                : "No items in this library yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
