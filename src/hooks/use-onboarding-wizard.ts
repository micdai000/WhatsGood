"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

export function useOnboardingWizard(currentRoute: string) {
  const router = useRouter();
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
    if (!hydrated || currentRoute === "/welcome") return;

    if (!isStepAccessible(currentRoute, state)) {
      router.replace(getEarliestIncompleteRoute(state));
    }
  }, [currentRoute, hydrated, router, state]);

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

  const isReady = hydrated;

  const stepMeta = useMemo(
    () => ({
      totalSteps: ONBOARDING.TOTAL_STEPS,
    }),
    [],
  );

  return {
    state,
    updateState,
    resetState,
    isReady,
    stepMeta,
  };
}
