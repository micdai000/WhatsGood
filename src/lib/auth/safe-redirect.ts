/**
 * Validates post-login redirect targets to prevent open-redirect attacks.
 * Only same-origin relative paths are allowed.
 */
export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!value) return fallback;

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return fallback;
  }

  if (trimmed.startsWith("/login") || trimmed.startsWith("/signup")) {
    return fallback;
  }

  return trimmed;
}

/** @deprecated Use getSafeRedirectPath */
export const sanitizeRedirectPath = getSafeRedirectPath;
