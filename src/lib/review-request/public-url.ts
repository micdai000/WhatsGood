import { getSiteUrl } from "@/lib/auth/routes";

export function getReviewRequestPath(token: string): string {
  return `/review/request/${token}`;
}

export function getReviewRequestUrl(token: string): string {
  return `${getSiteUrl()}${getReviewRequestPath(token)}`;
}
