import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppChrome } from "@/components/layout/app-chrome";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl } from "@/lib/auth/routes";
import { getCanonicalUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: getCanonicalUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
          <AppChrome>{children}</AppChrome>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
