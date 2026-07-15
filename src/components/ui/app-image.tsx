import { cn } from "@/lib/utils";

interface AppImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

export function AppImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  loading,
  ...rest
}: AppImageProps) {
  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
        loading={loading ?? "lazy"}
        decoding="async"
        {...rest}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading ?? "lazy"}
      decoding="async"
      {...rest}
    />
  );
}
