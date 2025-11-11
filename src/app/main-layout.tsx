
"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "./app-footer";
import { GoogleAd } from "@/components/google-ad";
import { GoogleSidebarAd } from "@/components/google-sidebar-ad";
import { PageViewsWidget } from "@/components/page-views-widget";

export function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  // Define paths that should not have sidebars
  const noSidebarPaths = ['/', '/about', '/contact', '/privacy-policy', '/terms-and-conditions', '/blog'];
  const hasSidebars = !noSidebarPaths.includes(pathname) && !pathname.startsWith('/admin') && !pathname.startsWith('/blog/');

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <GoogleAd />
      <div className="flex-1 container mx-auto">
        <div className={hasSidebars ? "grid lg:grid-cols-[200px_1fr_200px] gap-8" : ""}>
          {hasSidebars && (
            <aside className="hidden lg:block py-8">
              <div className="sticky top-20">
                <GoogleSidebarAd />
              </div>
            </aside>
          )}
          <main className="flex-1 min-w-0">
            {children}
          </main>
          {hasSidebars && (
            <aside className="hidden lg:block py-8">
              <div className="sticky top-20">
                <GoogleSidebarAd />
              </div>
            </aside>
          )}
        </div>
      </div>
      <AppFooter />
      <PageViewsWidget />
    </div>
  );
}
