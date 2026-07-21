import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { UserMenu } from "@/components/layout/user-menu";
import { useAuthContext } from "@/contexts/auth-context";
import { isAuthRoute, PRO_SIGNUP_ROUTE } from "@/lib/auth/routes";
import { SITE_NAME } from "@/lib/seo/site";
import { cn } from "@/lib/utils";

const publicNavLinks = [
  { href: "/search", label: "Discover" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const { user, loading } = useAuthContext();

  if (isAuthRoute(pathname)) {
    return null;
  }

  const isAuthenticated = !loading && !!user;

  const navLinks = isAuthenticated
    ? [{ href: "/dashboard", label: "Dashboard" }, ...publicNavLinks]
    : publicNavLinks;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md",
        className,
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link
          to="/"
          className="text-[15px] font-semibold tracking-tight text-primary transition-opacity hover:opacity-80"
        >
          {SITE_NAME}
        </Link>

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(`${link.href}/`));

            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm transition-colors",
                  isActive
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {loading ? null : isAuthenticated ? (
          <UserMenu userId={user.id} email={user.email} />
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden sm:inline-flex",
              )}
            >
              Log in
            </Link>
            <Link to={PRO_SIGNUP_ROUTE} className={buttonVariants({ size: "sm" })}>
              Join as a pro
            </Link>
          </div>
        )}
      </Container>
    </header>
  );
}
