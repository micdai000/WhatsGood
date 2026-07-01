"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isOnboardingRoute } from "@/lib/onboarding/constants";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = isOnboardingRoute(pathname);

  return (
    <>
      {!isOnboarding ? <SiteHeader /> : null}
      <main
        className={
          isOnboarding
            ? "min-h-dvh"
            : "min-h-dvh pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0"
        }
      >
        {children}
      </main>
      {!isOnboarding ? (
        <>
          <SiteFooter className="hidden md:block" />
          <BottomNav />
        </>
      ) : null}
    </>
  );
}
