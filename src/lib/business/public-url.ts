import { getSiteUrl } from "@/lib/public-env";

export function getPublicBusinessPath(slug: string): string {
  return `/b/${slug}`;
}

export function getPublicBusinessUrl(slug: string): string {
  return `${getSiteUrl()}${getPublicBusinessPath(slug)}`;
}
