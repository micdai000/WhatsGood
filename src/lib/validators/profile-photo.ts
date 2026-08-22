/**
 * Profile photos must be uploaded to the project's Supabase avatars bucket.
 */
import { getSupabaseUrl } from "@/lib/public-env";

export function isAllowedProfilePhotoUrl(url: string): boolean {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return false;

  try {
    const parsed = new URL(url);
    const base = new URL(supabaseUrl);
    return (
      parsed.origin === base.origin &&
      parsed.pathname.includes("/storage/v1/object/public/avatars/")
    );
  } catch {
    return false;
  }
}
