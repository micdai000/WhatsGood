import { Link } from "react-router-dom";
import { Home, LayoutDashboard, Search, UserRound } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth-context";
import { isAuthRoute } from "@/lib/auth/routes";
import { cn } from "@/lib/utils";

const publicTabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/signup", icon: UserRound, label: "Join" },
  { href: "/login", icon: LayoutDashboard, label: "Log in" },
] as const;

const proTabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/settings", icon: UserRound, label: "Account" },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const { user, loading } = useAuthContext();

  if (pathname === "/style-guide" || isAuthRoute(pathname)) {
    return null;
  }

  const tabs = !loading && user ? proTabs : publicTabs;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-4 pb-[env(safe-area-inset-bottom,8px)] pt-1.5">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : href === "/dashboard"
                ? pathname === "/dashboard" || pathname.startsWith("/dashboard/")
                : pathname.startsWith(href);

          return (
            <Link
              key={href}
              to={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-2"
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2 : 1.5}
                className={cn(
                  "transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
