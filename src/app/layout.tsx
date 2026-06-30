import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TrustLoop",
  description:
    "Build trust through verified reviews. Professional reputation for independent experts.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(inter.variable, "font-sans")}>
      <body className="overflow-x-hidden font-sans antialiased">
        <Providers>
          <SiteHeader />
          <main className="min-h-dvh pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
            {children}
          </main>
          <SiteFooter className="hidden md:block" />
          <BottomNav />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
