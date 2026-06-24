"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", icon: Home },
  { href: "/search", icon: Search },
  { href: "/create", icon: Plus },
  { href: "/libraries", icon: BookOpen },
  { href: "/profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-neutral-100 bg-white">
      <div className="mx-auto flex max-w-lg lg:max-w-2xl items-center justify-around px-4 pb-[env(safe-area-inset-bottom,8px)] pt-1.5">
        {tabs.map(({ href, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          const isCreate = href === "/create";

          if (isCreate) {
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center -mt-4"
              >
                <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#111] text-white ring-4 ring-white">
                  <Icon size={24} strokeWidth={2} />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-center py-2 px-3"
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2 : 1.5}
                className={cn(
                  "transition-colors",
                  isActive ? "text-[#111]" : "text-[#B0B0B0]",
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
