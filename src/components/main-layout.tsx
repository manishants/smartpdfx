
"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "./app-footer";
import { GoogleAd } from "./google-ad";
import { BottomAdsSection } from "./bottom-ads-section";

export function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Full-width, no global header/footer/ads for admin and superadmin dashboards
  if (pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <GoogleAd />
      <main className="flex-1 w-full">
        {children}
      </main>
      <BottomAdsSection />
      <AppFooter />
    </div>
  );
}
