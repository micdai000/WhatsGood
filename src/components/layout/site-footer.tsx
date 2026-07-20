import { Link } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { Caption, Muted } from "@/components/typography/typography";
import { Separator } from "@/components/ui/separator";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";
import { cn } from "@/lib/utils";

const footerLinks = [
  { href: "/search", label: "Discover" },
  { href: "/about", label: "About" },
  { href: "/login", label: "Log in" },
] as const;

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-border bg-card", className)}>
      <Container className="py-10 sm:py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">{SITE_NAME}</p>
            <Muted className="max-w-xs">{SITE_DESCRIPTION}</Muted>
          </div>

          <nav
            className="flex flex-wrap gap-x-6 gap-y-2"
            aria-label="Footer navigation"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Separator className="my-8" />

        <Caption>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </Caption>
      </Container>
    </footer>
  );
}
