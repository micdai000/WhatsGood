/**
 * Restricts post-auth redirects to same-origin relative paths.
 * Prevents open-redirect attacks via crafted `next` query params.
 */
export function sanitizeRedirectPath(
  next: string | null | undefined,
  fallback = "/login",
): string {
  if (!next) return fallback;

  const trimmed = next.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return fallback;
  }

  return trimmed;
}
