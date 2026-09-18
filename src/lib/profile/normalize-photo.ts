import { LIMITS } from "@/lib/constants";

const MAX_DIMENSION = 1600;
const JPEG_QUALITIES = [0.85, 0.7, 0.55, 0.4] as const;

export function fitWithin(
  width: number,
  height: number,
  maxDimension = MAX_DIMENSION,
): { width: number; height: number } {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const longest = Math.max(safeWidth, safeHeight);

  if (longest <= maxDimension) {
    return { width: safeWidth, height: safeHeight };
  }

  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(safeWidth * scale)),
    height: Math.max(1, Math.round(safeHeight * scale)),
  };
}

export async function normalizeProfilePhoto(file: Blob): Promise<File> {
  const source = await loadImage(file);
  const size = fitWithin(source.width, source.height);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("We couldn't process that photo. Please try another image.");
  }

  context.drawImage(source, 0, 0, size.width, size.height);
  closeImage(source);

  const blob = await canvasToJpeg(canvas, LIMITS.PROFILE_PHOTO_MAX_BYTES);
  return new File([blob], "profile.jpg", { type: "image/jpeg" });
}

async function loadImage(file: Blob): Promise<CanvasImageSource & { width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Fall through to the <img> path when the browser cannot decode the file this way.
    }
  }

  return loadImageElement(file);
}

function loadImageElement(
  file: Blob,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          "We couldn't read that photo. Try another image from your library.",
        ),
      );
    };
    image.src = objectUrl;
  });
}

function closeImage(source: CanvasImageSource) {
  if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
    source.close();
  }
}

async function canvasToJpeg(
  canvas: HTMLCanvasElement,
  maxBytes: number,
): Promise<Blob> {
  let lastBlob: Blob | null = null;

  for (const quality of JPEG_QUALITIES) {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });

    if (!blob) continue;
    lastBlob = blob;
    if (blob.size <= maxBytes) {
      return blob;
    }
  }

  if (lastBlob && lastBlob.size <= maxBytes) {
    return lastBlob;
  }

  throw new Error(
    "That photo is too large. Try a closer crop or another image from your library.",
  );
}
