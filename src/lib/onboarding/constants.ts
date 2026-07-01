import { ONBOARDING } from "@/lib/constants";

export const ONBOARDING_ROUTES = {
  welcome: "/welcome",
  dashboard: "/dashboard",
  profession: "/onboarding/profession",
  name: "/onboarding/name",
  username: "/onboarding/username",
  bio: "/onboarding/bio",
  photo: "/onboarding/photo",
  location: "/onboarding/location",
  review: "/onboarding/review",
} as const;

export const ONBOARDING_WIZARD_ROUTES = [
  ONBOARDING_ROUTES.profession,
  ONBOARDING_ROUTES.name,
  ONBOARDING_ROUTES.username,
  ONBOARDING_ROUTES.bio,
  ONBOARDING_ROUTES.photo,
  ONBOARDING_ROUTES.location,
  ONBOARDING_ROUTES.review,
] as const;

export type OnboardingWizardRoute =
  (typeof ONBOARDING_WIZARD_ROUTES)[number];

export function isWelcomeRoute(pathname: string): boolean {
  return pathname === ONBOARDING_ROUTES.welcome;
}

export function isOnboardingWizardRoute(pathname: string): boolean {
  return ONBOARDING_WIZARD_ROUTES.includes(
    pathname as OnboardingWizardRoute,
  );
}

export function isOnboardingRoute(pathname: string): boolean {
  return isWelcomeRoute(pathname) || isOnboardingWizardRoute(pathname);
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
  if (isOnboardingRoute(pathname) && hasProfile) {
    return ONBOARDING_ROUTES.dashboard;
  }

  if (isDashboardRoute(pathname) && !hasProfile) {
    return ONBOARDING_ROUTES.welcome;
  }

  return null;
}

export { ONBOARDING };
