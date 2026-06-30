"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, BookOpen, User } from "lucide-react";
import { isAuthRoute } from "@/lib/auth/routes";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/create", icon: Plus, label: "Create" },
  { href: "/libraries", icon: BookOpen, label: "Libraries" },
  { href: "/profile", icon: User, label: "Profile" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/style-guide" || isAuthRoute(pathname)) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-4 pb-[env(safe-area-inset-bottom,8px)] pt-1.5">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          const isCreate = href === "/create";

          if (isCreate) {
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className="flex items-center justify-center -mt-4"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">
                  <Icon size={22} strokeWidth={2} />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="flex items-center justify-center px-3 py-2"
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2 : 1.5}
                className={cn(
                  "transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
