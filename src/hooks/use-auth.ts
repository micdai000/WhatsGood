"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import type { AuthSession, AuthUser } from "@/types";

export function useSession(): {
  session: AuthSession | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const { session, loading, refresh } = useAuthContext();
  return { session, loading, refresh };
}

export function useCurrentUser(): {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const { user, loading, refresh } = useAuthContext();
  return { user, loading, refresh };
}

export function useRequireAuth(redirectTo = "/login") {
  const router = useRouter();
  const auth = useAuthContext();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace(redirectTo);
    }
  }, [auth.loading, auth.user, redirectTo, router]);

  return auth;
}
