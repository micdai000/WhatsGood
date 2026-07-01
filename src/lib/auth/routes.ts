export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/pricing",
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

  return false;
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number]);
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}
