import { generateQrPngDataUrl } from "@/lib/qr/generate-png";

export async function downloadQrPng(destinationUrl: string, filename: string) {
  const dataUrl = await generateQrPngDataUrl(destinationUrl, 1000);
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  anchor.click();
}
