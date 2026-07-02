import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/auth/routes";

const STATIC_PATHS = [
  "/",
  "/about",
  "/pricing",
  "/search",
  "/login",
  "/signup",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
