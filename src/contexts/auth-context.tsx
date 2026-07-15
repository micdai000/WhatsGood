import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapSupabaseUser } from "@/lib/auth/map-user";
import type { AuthSession } from "@/types";

interface AuthContextValue {
  user: AuthSession["user"] | null;
  session: AuthSession | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapSupabaseSession(
  session: Awaited<
    ReturnType<ReturnType<typeof createClient>["auth"]["getSession"]>
  >["data"]["session"],
): AuthSession | null {
  if (!session?.user?.email_confirmed_at) {
    return null;
  }

  return {
    user: mapSupabaseUser(session.user),
    expiresAt: session.expires_at ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    setSession(mapSupabaseSession(currentSession));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function hydrate() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setSession(mapSupabaseSession(currentSession));
      setLoading(false);
    }

    void hydrate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return;
      setSession(mapSupabaseSession(currentSession));
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
