import { AppChrome } from "@/components/layout/app-chrome";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Outlet } from "react-router-dom";

export function RootLayout() {
  return (
    <div className={cn("font-sans", "min-h-dvh")} style={{ fontFamily: "Inter, sans-serif" }}>
      <AuthProvider>
        <Providers>
          <AppChrome>
            <Outlet />
          </AppChrome>
          <Toaster />
        </Providers>
      </AuthProvider>
    </div>
  );
}
