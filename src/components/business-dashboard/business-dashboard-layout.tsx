import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ErrorState } from "@/components/layout/error-state";
import { LoadingState } from "@/components/layout/loading-state";
import { Muted } from "@/components/typography/typography";
import { StatusAlert } from "@/components/ui/status-alert";
import { BusinessWorkspaceProvider, useBusinessWorkspace } from "@/contexts/business-workspace-context";
import { isQrPrintRoute } from "@/lib/qr/print-route";
import { displayCategoryName } from "@/lib/business/categories";
import { cn } from "@/lib/utils";

const NAV_ITEMS: Array<{ to: string; label: string; end?: boolean }> = [
  { to: "/dashboard", label: "Dashboard", end: true },
  { to: "/dashboard/profile", label: "Profile" },
  { to: "/dashboard/qr", label: "QR Code" },
  { to: "/dashboard/settings", label: "Settings" },
];

export function BusinessDashboardLayout() {
  return (
    <BusinessWorkspaceProvider>
      <BusinessDashboardShell />
    </BusinessWorkspaceProvider>
  );
}

function BusinessDashboardShell() {
  const { pathname } = useLocation();
  const {
    currentBusiness,
    businesses,
    categories,
    locations,
    loading,
    error,
    refresh,
    loadQrCodes,
    setCurrentBusinessId,
  } = useBusinessWorkspace();

  useEffect(() => {
    if (!currentBusiness) return;
    if (!pathname.startsWith("/dashboard/qr")) return;
    void loadQrCodes(currentBusiness.id);
  }, [pathname, currentBusiness, loadQrCodes]);

  if (loading) {
    return <LoadingState label="Loading your business…" fullPage />;
  }

  if (error) {
    return (
      <Section>
        <Container className="max-w-3xl">
          <ErrorState
            title="Unable to load your business"
            description={error}
            onRetry={() => void refresh()}
          />
        </Container>
      </Section>
    );
  }

  if (!currentBusiness) {
    return (
      <Section>
        <Container className="max-w-3xl">
          <ErrorState
            title="No business selected"
            description="Create or claim a business to use the dashboard."
          />
        </Container>
      </Section>
    );
  }

  if (isQrPrintRoute(pathname)) {
    return <Outlet />;
  }

  const category = categories.find(
    (item) => item.id === currentBusiness.categoryId,
  );
  const categoryName = displayCategoryName(
    category,
    currentBusiness.customCategory,
  );
  const primary = locations.find((location) => location.isPrimary) ?? locations[0];
  const locationLabel = primary
    ? [primary.city, primary.state].filter(Boolean).join(", ")
    : null;

  return (
    <Section>
      <Container className="max-w-4xl space-y-8">
        <header className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {currentBusiness.name}
              </h1>
              <Muted>
                {[categoryName, locationLabel, labelStatus(currentBusiness.status)]
                  .filter(Boolean)
                  .join(" · ") || "Add a category and location to complete your profile."}
              </Muted>
            </div>
            {businesses.length > 1 ? (
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Current Business</span>
                <select
                  value={currentBusiness.id}
                  onChange={(event) => setCurrentBusinessId(event.target.value)}
                  className="h-8 w-full min-w-48 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          {currentBusiness.status !== "active" ? (
            <StatusAlert
              status="warning"
              title={currentBusiness.status === "suspended" ? "Suspended" : "Archived"}
              description="This business is not currently public on Meritt. Customer QR codes and feedback are paused."
            />
          ) : null}

          <nav
            aria-label="Business"
            className="flex flex-wrap gap-1 border-b border-border"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "border-b-2 px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "border-primary font-medium text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <Outlet />
      </Container>
    </Section>
  );
}

function labelStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
