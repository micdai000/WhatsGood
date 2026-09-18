import type { User } from "@supabase/supabase-js";
import type { AuthUser } from "@/types";

function readTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function mapSupabaseUser(user: User): AuthUser {
  const metadata = user.user_metadata ?? {};

  return {
    id: user.id,
    email: user.email ?? "",
    emailVerified: Boolean(user.email_confirmed_at),
    fullName:
      readTrimmedString(metadata.full_name) ??
      readTrimmedString(metadata.fullName) ??
      readTrimmedString(metadata.name),
    avatarUrl:
      readTrimmedString(metadata.avatar_url) ??
      readTrimmedString(metadata.avatarUrl) ??
      readTrimmedString(metadata.picture),
  };
}
