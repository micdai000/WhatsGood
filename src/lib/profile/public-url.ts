import { getSiteUrl } from "@/lib/auth/routes";

export function getPublicProfilePath(username: string): string {
  return `/@${username}`;
}

export function getPublicProfileUrl(username: string): string {
  return `${getSiteUrl()}${getPublicProfilePath(username)}`;
}
