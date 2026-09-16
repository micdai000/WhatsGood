import { getSiteUrl as getPublicSiteUrl } from "@/lib/public-env";

export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/search",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

export const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

/** Where new businesses create a Meritt account. */
export const PRO_SIGNUP_ROUTE = "/signup";

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number])) {
    return true;
  }

  if (pathname.startsWith("/auth/callback")) {
    return true;
  }

  // Public professional profiles: /@username (rewritten to /u/username)
  if (/^\/@[a-z0-9-]+$/.test(pathname) || /^\/u\/[a-z0-9-]+$/.test(pathname)) {
    return true;
  }

  // Leave a review — open to guests and signed-in users
  if (/^\/review\/[a-z0-9-]+$/.test(pathname)) {
    return true;
  }

  // Token-based review request links
  if (/^\/review\/request\/[0-9a-f-]{36}$/i.test(pathname)) {
    return true;
  }

  // Public QR destinations: /q/<code>
  if (/^\/q\/[0-9a-z_-]+$/i.test(pathname)) {
    return true;
  }

  // Public business profiles: /b/<slug>
  if (/^\/b\/[a-z0-9-]+$/.test(pathname)) {
    return true;
  }

  return false;
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number]);
}

export function getSiteUrl(): string {
  return getPublicSiteUrl();
}

/** Origin + path for email confirmation and recovery links. No query string — extra params break Supabase redirect allowlists. */
export function getAuthCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`;
}
