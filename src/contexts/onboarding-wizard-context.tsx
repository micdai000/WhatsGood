import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ONBOARDING } from "@/lib/constants";
import {
  EMPTY_ONBOARDING_STATE,
  getEarliestIncompleteRoute,
  isStepAccessible,
  type OnboardingWizardState,
} from "@/lib/onboarding/wizard-state";
import { generateSlug } from "@/lib/utils/slug";

function readStoredState(): OnboardingWizardState {
  if (typeof window === "undefined") {
    return EMPTY_ONBOARDING_STATE;
  }

  try {
    const raw = window.localStorage.getItem(ONBOARDING.STORAGE_KEY);
    if (!raw) return EMPTY_ONBOARDING_STATE;
    const parsed = JSON.parse(raw) as Partial<OnboardingWizardState>;
    return { ...EMPTY_ONBOARDING_STATE, ...parsed };
  } catch {
    return EMPTY_ONBOARDING_STATE;
  }
}

function writeStoredState(state: OnboardingWizardState) {
  window.localStorage.setItem(ONBOARDING.STORAGE_KEY, JSON.stringify(state));
}

export function clearOnboardingStorage() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ONBOARDING.STORAGE_KEY);
  }
}

interface OnboardingWizardContextValue {
  state: OnboardingWizardState;
  updateState: (patch: Partial<OnboardingWizardState>) => void;
  resetState: () => void;
  isReady: boolean;
}

const OnboardingWizardContext =
  createContext<OnboardingWizardContextValue | null>(null);

export function OnboardingWizardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<OnboardingWizardState>(EMPTY_ONBOARDING_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStoredState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredState(state);
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated || pathname === "/welcome") return;

    if (!isStepAccessible(pathname, state)) {
      navigate(getEarliestIncompleteRoute(state));
    }
  }, [pathname, hydrated, navigate, state]);

  const updateState = useCallback((patch: Partial<OnboardingWizardState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };

      if (patch.slug !== undefined) {
        next.slugManuallyEdited = true;
      } else if (patch.fullName !== undefined && !prev.slugManuallyEdited) {
        next.slug = generateSlug(patch.fullName);
      }

      return next;
    });
  }, []);

  const resetState = useCallback(() => {
    setState(EMPTY_ONBOARDING_STATE);
    clearOnboardingStorage();
  }, []);

  const value: OnboardingWizardContextValue = {
    state,
    updateState,
    resetState,
    isReady: hydrated,
  };

  return (
    <OnboardingWizardContext.Provider value={value}>
      {children}
    </OnboardingWizardContext.Provider>
  );
}

export function useOnboardingWizard() {
  const context = useContext(OnboardingWizardContext);

  if (!context) {
    throw new Error(
      "useOnboardingWizard must be used within OnboardingWizardProvider",
    );
  }

  return context;
}
