export function getSupabaseUrl(): string {
  return (
    import.meta.env.VITE_SUPABASE_URL ??
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

export function getSupabaseAnonKey(): string {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Live site origin used when env/browser still point at localhost. */
export const CANONICAL_SITE_URL = "https://www.themeritt.com";

function normalizeSiteUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalhostUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]"
    );
  } catch {
    return false;
  }
}

/** Resolves the public site origin. Exported for tests. */
export function resolveSiteUrl(options: {
  configuredUrl?: string;
  browserOrigin?: string;
  canonicalUrl?: string;
}): string {
  const configured = options.configuredUrl
    ? normalizeSiteUrl(options.configuredUrl)
    : "";
  const browserOrigin = options.browserOrigin
    ? normalizeSiteUrl(options.browserOrigin)
    : "";
  const canonical = options.canonicalUrl
    ? normalizeSiteUrl(options.canonicalUrl)
    : "";

  if (browserOrigin && !isLocalhostUrl(browserOrigin)) {
    return browserOrigin;
  }

  if (configured && !isLocalhostUrl(configured)) {
    return configured;
  }

  if (canonical && !isLocalhostUrl(canonical)) {
    return canonical;
  }

  if (browserOrigin) {
    return browserOrigin;
  }

  if (configured) {
    return configured;
  }

  return "http://localhost:3000";
}

export function getSiteUrl(): string {
  return resolveSiteUrl({
    configuredUrl:
      import.meta.env.VITE_SITE_URL ?? import.meta.env.NEXT_PUBLIC_SITE_URL,
    browserOrigin:
      typeof window !== "undefined" ? window.location.origin : undefined,
    canonicalUrl: CANONICAL_SITE_URL,
  });
}
