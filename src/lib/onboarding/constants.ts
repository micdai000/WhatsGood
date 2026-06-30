export const ONBOARDING_ROUTES = {
  welcome: "/welcome",
  dashboard: "/dashboard",
} as const;

export function isWelcomeRoute(pathname: string): boolean {
  return pathname === ONBOARDING_ROUTES.welcome;
}

export function isDashboardRoute(pathname: string): boolean {
  return (
    pathname === ONBOARDING_ROUTES.dashboard ||
    pathname.startsWith("/dashboard/")
  );
}

export function resolveOnboardingRedirect(
  pathname: string,
  hasProfile: boolean,
): string | null {
  if (isWelcomeRoute(pathname) && hasProfile) {
    return ONBOARDING_ROUTES.dashboard;
  }

  if (isDashboardRoute(pathname) && !hasProfile) {
    return ONBOARDING_ROUTES.welcome;
  }

  return null;
}
