import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isOnboardingRoute } from "@/lib/onboarding/constants";
import { isQrPrintRoute } from "@/lib/qr/print-route";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isOnboarding = isOnboardingRoute(pathname);
  const isPrint = isQrPrintRoute(pathname);
  const hideChrome = isOnboarding || isPrint;
  const noIndex =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    isOnboarding;

  useEffect(() => {
    const existing = document.head.querySelector('meta[name="robots"]');
    if (!noIndex) {
      existing?.remove();
      return;
    }

    let element = existing;
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute("name", "robots");
      document.head.appendChild(element);
    }
    element.setAttribute("content", "noindex, nofollow");
  }, [noIndex]);

  return (
    <>
      {!hideChrome ? <SiteHeader /> : null}
      <main
        className={
          hideChrome
            ? "min-h-dvh"
            : "min-h-dvh pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0"
        }
      >
        {children}
      </main>
      {!hideChrome ? (
        <>
          <SiteFooter className="hidden md:block" />
          <BottomNav />
        </>
      ) : null}
    </>
  );
}
