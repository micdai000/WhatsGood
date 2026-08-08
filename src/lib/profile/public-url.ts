import { getSiteUrl } from "@/lib/auth/routes";

export function getPublicProfilePath(username: string): string {
  const slug = username.trim();
  if (!slug) {
    return "/search";
  }

  return `/u/${slug}`;
}

/** Absolute URL for sharing (email, clipboard, open graph). Uses configured site URL in production. */
export function getPublicProfileUrl(username: string): string {
  return `${getSiteUrl()}${getPublicProfilePath(username)}`;
}

/** Strip hostname from absolute URLs so in-app links stay on the current deployment (prod vs local). */
export function resolveInAppProfileBackPath(
  href: string,
  fallbackUsername?: string,
): string {
  let path = href.trim();

  if (!path) {
    return fallbackUsername
      ? getPublicProfilePath(fallbackUsername)
      : "/search";
  }

  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      path = `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return fallbackUsername
        ? getPublicProfilePath(fallbackUsername)
        : "/search";
    }
  }

  if (path === "/u/" || path === "/u") {
    return fallbackUsername
      ? getPublicProfilePath(fallbackUsername)
      : "/search";
  }

  return path;
}
