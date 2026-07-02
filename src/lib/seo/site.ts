import { getSiteUrl } from "@/lib/auth/routes";

export const SITE_NAME = "TrustLoop";

export const SITE_DESCRIPTION =
  "Build trust through verified reviews. Professional reputation for independent experts.";

export function getCanonicalUrl(path = "/"): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized === "/" ? "" : normalized}`;
}

export const DEFAULT_OG_IMAGE = "/images/og-default.png";
