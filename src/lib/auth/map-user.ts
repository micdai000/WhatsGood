import type { User } from "@supabase/supabase-js";
import type { AuthUser } from "@/types";

export function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    emailVerified: Boolean(user.email_confirmed_at),
  };
}
