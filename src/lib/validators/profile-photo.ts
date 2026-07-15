/**
 * Profile photos must be uploaded to the project's Supabase avatars bucket.
 */
export function isAllowedProfilePhotoUrl(url: string): boolean {
  const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
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
