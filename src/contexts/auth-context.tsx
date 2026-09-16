import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  if (!session?.user) {
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
  const navigate = useNavigate();

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

      const params = new URLSearchParams(window.location.search);
      if (params.get("type") === "recovery" && currentSession) {
        navigate("/reset-password", { replace: true });
      }
    }

    void hydrate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return;
      setSession(mapSupabaseSession(currentSession));
      setLoading(false);

      if (event === "PASSWORD_RECOVERY") {
        navigate("/reset-password", { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

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
