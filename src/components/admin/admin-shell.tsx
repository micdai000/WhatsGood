"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  LayoutDashboard,
  MessageSquare,
  Shield,
  UserCircle,
  Users,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import type { AdminRole } from "@/types";
import { cn } from "@/lib/utils";

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}> = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/profiles", label: "Profiles", icon: UserCircle },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/professions", label: "Professions", icon: Briefcase },
];

interface AdminShellProps {
  role: AdminRole;
  children: React.ReactNode;
}

export function AdminShell({ role, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <Section>
      <Container className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="size-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-lg font-semibold">TrustLoop Admin</h1>
              <p className="text-sm text-muted-foreground">Internal moderation tools</p>
            </div>
          </div>
          <Badge variant="secondary" className="capitalize">
            {role}
          </Badge>
        </header>

        <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <nav aria-label="Admin navigation">
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <li key={item.href} className="shrink-0 lg:shrink">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <main>{children}</main>
        </div>
      </Container>
    </Section>
  );
}
