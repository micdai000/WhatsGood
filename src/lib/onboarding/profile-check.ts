import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Lightweight profile existence check for middleware (edge-compatible).
 */
export async function profileExistsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}
