import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import { allEntities, formatCount, type Library } from "@/data/mock";

interface LibraryCardProps {
  library: Library;
  className?: string;
}

export function LibraryCard({ library, className }: LibraryCardProps) {
  const previewEntities = library.entityIds
    .slice(0, 3)
    .map((id) => allEntities.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => !!e);

  return (
    <Link
      href={`/library/${library.id}`}
      className={cn(
        "group block shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-100 transition-all duration-200 hover:ring-neutral-200 hover:shadow-lg active:scale-[0.99]",
        !className?.includes("w-") && "card-row-item card-row-item--wide",
        className,
      )}
    >
      <div className="relative aspect-[2/1] w-full overflow-hidden sm:aspect-[21/9]">
        <Image
          src={library.coverImage}
          alt={library.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, 560px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/5" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#111] backdrop-blur-sm">
            {library.entityCount} items
          </span>
          {library.isLocationBased && library.location && (
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#111] backdrop-blur-sm">
              <MapPin className="h-3 w-3" />
              {library.location}
            </span>
          )}
        </div>

        {previewEntities.length > 0 && (
          <div className="absolute right-3 top-3 flex -space-x-2">
            {previewEntities.map((entity) => (
              <div
                key={entity.id}
                className="relative h-9 w-9 overflow-hidden rounded-lg ring-2 ring-white"
              >
                <Image
                  src={entity.image}
                  alt={entity.name}
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </div>
            ))}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-lg font-bold leading-tight text-white sm:text-xl">
            {library.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/80">
            {library.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <UserAvatar
            src={library.creator.avatar}
            alt={library.creator.displayName}
            size={24}
          />
          <span className="truncate text-[13px] text-neutral-500">
            {library.creator.displayName}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[12px] text-neutral-400">
          <span>{formatCount(library.followerCount)} followers</span>
          <ChevronRight className="h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#D4A017]" />
        </div>
      </div>
    </Link>
  );
}
