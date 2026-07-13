import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AdminShell } from "@/components/admin";
import { Spinner } from "@/components/ui/spinner";
import { requireAdmin } from "@/lib/admin/authorization";
import type { AdminRole } from "@/types";
import { isFailure } from "@/types";

export function RequireAdmin() {
  const [state, setState] = useState<
    { status: "loading" } | { status: "denied" } | { status: "ok"; role: AdminRole }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    requireAdmin().then((result) => {
      if (cancelled) return;
      if (isFailure(result)) {
        setState({ status: "denied" });
        return;
      }
      setState({ status: "ok", role: result.data.role });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (state.status === "denied") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminShell role={state.role}>
      <Outlet />
    </AdminShell>
  );
}
