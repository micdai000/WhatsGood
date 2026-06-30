import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Caption, Muted } from "@/components/typography/typography";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const footerLinks = [
  { href: "/search", label: "Discover" },
  { href: "/libraries", label: "Libraries" },
  { href: "/style-guide", label: "Style Guide" },
  { href: "/login", label: "Log in" },
] as const;

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-border bg-background", className)}>
      <Container className="py-10 sm:py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">TrustLoop</p>
            <Muted className="max-w-xs">
              Build trust through verified reviews. Professional reputation for
              independent experts.
            </Muted>
          </div>

          <nav
            className="flex flex-wrap gap-x-6 gap-y-2"
            aria-label="Footer navigation"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Separator className="my-8" />

        <Caption>
          © {new Date().getFullYear()} TrustLoop. All rights reserved.
        </Caption>
      </Container>
    </footer>
  );
}
