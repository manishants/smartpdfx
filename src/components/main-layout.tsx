
"use client";

import { type ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "./app-footer";
import { GoogleAd } from "./google-ad";
import { BottomAdsSection } from "./bottom-ads-section";

export function MainLayout({ children }: { children: ReactNode }) {
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
