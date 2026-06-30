import { ONBOARDING_ROUTES } from "./constants";

export interface OnboardingWizardState {
  professionId: string | null;
  fullName: string;
  slug: string;
  slugManuallyEdited: boolean;
  bio: string;
  profilePhotoUrl: string | null;
  city: string;
  state: string;
}

export const EMPTY_ONBOARDING_STATE: OnboardingWizardState = {
  professionId: null,
  fullName: "",
  slug: "",
  slugManuallyEdited: false,
  bio: "",
  profilePhotoUrl: null,
  city: "",
  state: "",
};

export const ONBOARDING_STEP_META = [
  { route: ONBOARDING_ROUTES.welcome, label: "Welcome", step: 1 },
  { route: ONBOARDING_ROUTES.profession, label: "Profession", step: 2 },
  { route: ONBOARDING_ROUTES.name, label: "Display name", step: 3 },
  { route: ONBOARDING_ROUTES.username, label: "Username", step: 4 },
  { route: ONBOARDING_ROUTES.bio, label: "Bio", step: 5 },
  { route: ONBOARDING_ROUTES.photo, label: "Photo", step: 6 },
  { route: ONBOARDING_ROUTES.location, label: "Location", step: 7 },
  { route: ONBOARDING_ROUTES.review, label: "Review", step: 8 },
] as const;

export function getStepMetaForRoute(route: string) {
  return (
    ONBOARDING_STEP_META.find((step) => step.route === route) ??
    ONBOARDING_STEP_META[0]
  );
}

export function getNextRoute(route: string): string | null {
  const index = ONBOARDING_STEP_META.findIndex((step) => step.route === route);
  if (index === -1 || index >= ONBOARDING_STEP_META.length - 1) {
    return null;
  }
  return ONBOARDING_STEP_META[index + 1].route;
}

export function getPreviousRoute(route: string): string | null {
  const index = ONBOARDING_STEP_META.findIndex((step) => step.route === route);
  if (index <= 0) {
    return null;
  }
  return ONBOARDING_STEP_META[index - 1].route;
}

export function getEarliestIncompleteRoute(
  state: OnboardingWizardState,
): string {
  if (!state.professionId) return ONBOARDING_ROUTES.profession;
  if (!state.fullName.trim()) return ONBOARDING_ROUTES.name;
  if (!state.slug.trim()) return ONBOARDING_ROUTES.username;
  if (!state.city.trim() || !state.state.trim()) return ONBOARDING_ROUTES.location;
  return ONBOARDING_ROUTES.review;
}

export function isStepAccessible(
  route: string,
  state: OnboardingWizardState,
): boolean {
  const earliest = getEarliestIncompleteRoute(state);
  const routeIndex = ONBOARDING_STEP_META.findIndex((s) => s.route === route);
  const earliestIndex = ONBOARDING_STEP_META.findIndex(
    (s) => s.route === earliest,
  );

  if (route === ONBOARDING_ROUTES.welcome) return true;
  if (routeIndex === -1) return false;

  return routeIndex <= earliestIndex;
}

export function toCreateProfileInput(
  state: OnboardingWizardState,
): {
  slug: string;
  fullName: string;
  professionId: string;
  bio?: string | null;
  city: string;
  state: string;
  profilePhoto?: string | null;
} {
  return {
    slug: state.slug,
    fullName: state.fullName.trim(),
    professionId: state.professionId!,
    bio: state.bio.trim() || null,
    city: state.city.trim(),
    state: state.state.trim(),
    profilePhoto: state.profilePhotoUrl,
  };
}
