import { useEffect, useState } from "react";
import { generateQrPngDataUrl } from "@/lib/qr/generate-png";
import { cn } from "@/lib/utils";

export function QrImage({
  destination,
  size,
  alt,
  className,
}: {
  destination: string;
  size: number;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void generateQrPngDataUrl(destination, size).then((dataUrl) => {
      if (!cancelled) {
        setSrc(dataUrl);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [destination, size]);

  if (!src) {
    return (
      <div
        className={cn("animate-pulse bg-muted", className)}
        aria-hidden
      />
    );
  }

  return <img src={src} alt={alt} className={className} />;
}
