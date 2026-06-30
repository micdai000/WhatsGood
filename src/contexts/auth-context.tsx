"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { AuthSession, AuthUser } from "@/types";
import {
  getCurrentUserAction,
  getSessionAction,
  refreshSessionAction,
} from "@/app/actions/auth.actions";
import { isSuccess } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: AuthSession | null;
}) {
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await refreshSessionAction();
      if (isSuccess(result) && result.data) {
        setSession(result.data);
        return;
      }

      const sessionResult = await getSessionAction();
      if (isSuccess(sessionResult)) {
        setSession(sessionResult.data);
        return;
      }

      const userResult = await getCurrentUserAction();
      if (isSuccess(userResult) && userResult.data) {
        setSession({ user: userResult.data, expiresAt: null });
      } else {
        setSession(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      refresh,
    }),
    [session, loading, refresh],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
