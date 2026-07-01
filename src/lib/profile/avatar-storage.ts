/**
 * Extracts the storage object path from a Supabase avatars public URL.
 * Example: .../storage/v1/object/public/avatars/{userId}/123.jpg → {userId}/123.jpg
 */
export function extractAvatarStoragePath(url: string): string | null {
  const marker = "/storage/v1/object/public/avatars/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}
