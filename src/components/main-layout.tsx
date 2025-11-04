
"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "./app-footer";
import { GoogleHeaderAd } from "./google-header-ad";
import { BottomAdsSection } from "./bottom-ads-section";
import { GoogleSidebarAd } from "./google-sidebar-ad";

export function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Full-width, no global header/footer/ads for admin and superadmin dashboards
  if (pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <GoogleHeaderAd />
      {/* Sidebars appear on all tool pages; excluded on homepage */}
      <div className="flex-1 container mx-auto">
        {pathname !== '/' ? (
          <div className="grid lg:grid-cols-[240px_1fr_240px] gap-8">
            {/* Left Sidebar */}
            <aside className="hidden lg:block py-8">
              <div className="sticky top-20">
                <GoogleSidebarAd />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>

            {/* Right Sidebar */}
            <aside className="hidden lg:block py-8">
              <div className="sticky top-20">
                <GoogleSidebarAd />
              </div>
            </aside>
          </div>
        ) : (
          <main className="flex-1 w-full">
            {children}
          </main>
        )}
      </div>
      <BottomAdsSection />
      <AppFooter />
    </div>
  );
}
