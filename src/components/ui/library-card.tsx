import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";
import { formatCount, type Library } from "@/data/mock";

interface LibraryCardProps {
  library: Library;
  className?: string;
}

export function LibraryCard({ library, className }: LibraryCardProps) {
  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-2xl bg-white hover:shadow-md transition-shadow duration-200",
        !className?.includes("w-") && "w-[280px]",
        className,
      )}
    >
      <div className="relative h-[160px] overflow-hidden rounded-t-2xl">
        <Image
          src={library.coverImage}
          alt={library.name}
          fill
          className="object-cover"
          sizes="280px"
        />
      </div>
      <div className="p-4">
        <h3 className="text-[15px] font-semibold text-[#111] leading-snug">
          {library.name}
        </h3>
        <p className="text-[13px] text-neutral-500 mt-1 line-clamp-1">
          {library.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar
              src={library.creator.avatar}
              alt={library.creator.displayName}
              size={20}
            />
            <span className="text-[12px] text-neutral-400">
              {library.creator.displayName}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-neutral-400">
            <span>{library.entityCount} items</span>
            <span className="text-neutral-300">&middot;</span>
            <span>{formatCount(library.followerCount)} followers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
