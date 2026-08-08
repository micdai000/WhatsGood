import { getSiteUrl } from "@/lib/auth/routes";

export const SITE_NAME = "Meritt Pros";

export const SITE_DESCRIPTION =
  "Live reputation for independent professionals — current tiers updated monthly from verified client feedback.";

export function getCanonicalUrl(path = "/"): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized === "/" ? "" : normalized}`;
}

export const DEFAULT_OG_IMAGE = "/images/og-default.png";
