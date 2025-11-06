
"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "./app-footer";
import { GoogleHeaderAd } from "./google-header-ad";
import { BottomAdsSection } from "./bottom-ads-section";

export function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Full-width, no global header/footer/ads for admin and superadmin dashboards
  if (pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
    return <>{children}</>;
  }

  // Exclude sidebars from homepage and informational pages
  const noSidebarPaths = new Set([
    '/',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms-and-conditions',
    '/disclaimer',
    '/privacy-policy-generator',
    '/blog',
  ]);
  const isInfoPage = noSidebarPaths.has(pathname) || pathname.startsWith('/blog/');

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <GoogleHeaderAd />
      {/* Sidebars removed from all pages (tool and informational) */}
      <div className="flex-1 w-full px-2 sm:px-4">
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
      <BottomAdsSection />
      <AppFooter />
    </div>
  );
}
