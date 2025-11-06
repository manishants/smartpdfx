"use client";
import "./superadmin.css";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from "next/navigation";
import { checkRouteAccess } from '@/lib/auth/middleware';
import { Loader2 } from 'lucide-react';
import { SuperadminSidebar } from './dashboard/_components/sidebar';
import { useTheme } from "next-themes";

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { setTheme } = useTheme();
  
  // Show sidebar across superadmin routes except login

  useEffect(() => {
    async function checkAccess() {
      try {
        const { hasAccess: access, redirectTo } = await checkRouteAccess(pathname);
        
        if (!access && redirectTo) {
          router.push(redirectTo);
          return;
        }
        
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking access:', error);
        router.push('/superadmin/login');
      } finally {
        setIsLoading(false);
      }
    }

    checkAccess();
  }, [pathname, router]);

  // Force light theme across all superadmin routes for better readability
  useEffect(() => {
    try {
      localStorage.setItem("smartpdfx-theme-override", "true");
    } catch {}
    setTheme("light");
  }, [setTheme]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Allow login page to render even without access
  if (!hasAccess && pathname !== "/superadmin/login") {
    return null;
  }

  const showSidebar = pathname !== '/superadmin/login';

  return (
    <div className="superadmin-scope flex min-h-screen bg-gradient-to-b from-white to-slate-50">
      {showSidebar && <SuperadminSidebar />}
      <main className="flex-1 min-w-0 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}