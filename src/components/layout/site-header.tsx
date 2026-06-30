"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { isAuthRoute } from "@/lib/auth/routes";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/search", label: "Discover" },
  { href: "/libraries", label: "Libraries" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader({ className }: { className?: string }) {
  const pathname = usePathname();

  if (isAuthRoute(pathname)) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md",
        className,
      )}
    >
      <Container className="flex h-14 items-center justify-between sm:h-16">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          TrustLoop
        </Link>

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={buttonVariants({ size: "sm" })}
          >
            Get started
          </Link>
        </div>
      </Container>
    </header>
  );
}
