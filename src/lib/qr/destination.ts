import { getSiteUrl } from "@/lib/public-env";

export function getQrPath(code: string): string {
  return `/q/${code}`;
}

export function getQrUrl(code: string): string {
  return `${getSiteUrl()}${getQrPath(code)}`;
}

export function qrImageUrl(destinationUrl: string, size = 280): string {
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: destinationUrl,
    margin: "1",
    format: "png",
    color: "111111",
    bgcolor: "ffffff",
  });
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}
