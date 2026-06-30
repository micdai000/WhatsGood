import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function UserAvatar({ src, alt, size = 40, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-full shrink-0",
        size >= 40 && "ring-2 ring-white",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
