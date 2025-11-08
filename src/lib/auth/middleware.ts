"use client";

import { createClient } from '@/lib/supabase/client';
import { UserRole } from './roles';

type AccessResult = {
  hasAccess: boolean;
  redirectTo?: string;
};

export async function checkRouteAccess(pathname: string): Promise<AccessResult> {
  try {
    const isSupabaseDisabled = () =>
      process.env.NEXT_PUBLIC_DISABLE_SUPABASE === 'true' ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Public routes
    if (!pathname.startsWith('/superadmin') && !pathname.startsWith('/admin')) {
      return { hasAccess: true };
    }

    // Always allow login pages
    if (pathname === '/superadmin/login' || pathname === '/admin/login') {
      return { hasAccess: true };
    }

    // Fallback cookie-based access when Supabase is disabled
    if (isSupabaseDisabled()) {
      let role: string | undefined;
      try {
        const match = typeof document !== 'undefined' && document.cookie.match(/(?:^|; )spx_admin=([^;]+)/);
        role = match?.[1];
      } catch {}

      if (pathname.startsWith('/superadmin')) {
        if (role === 'superadmin') return { hasAccess: true };
        return { hasAccess: false, redirectTo: '/superadmin/login' };
      }

      if (pathname.startsWith('/admin')) {
        if (role === 'admin' || role === 'superadmin') return { hasAccess: true };
        return { hasAccess: false, redirectTo: '/admin/login' };
      }
    }

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return { hasAccess: false, redirectTo: pathname.startsWith('/superadmin') ? '/superadmin/login' : '/admin/login' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role as UserRole | undefined;
    if (pathname.startsWith('/superadmin')) {
      if (role === UserRole.SUPERADMIN) return { hasAccess: true };
      return { hasAccess: false, redirectTo: '/superadmin/login' };
    }

    if (pathname.startsWith('/admin')) {
      if (role === UserRole.ADMIN || role === UserRole.SUPERADMIN) return { hasAccess: true };
      return { hasAccess: false, redirectTo: '/admin/login' };
    }

    return { hasAccess: true };
  } catch {
    // Defensive default: require login
    if (pathname.startsWith('/superadmin')) {
      return { hasAccess: false, redirectTo: '/superadmin/login' };
    }
    if (pathname.startsWith('/admin')) {
      return { hasAccess: false, redirectTo: '/admin/login' };
    }
    return { hasAccess: true };
  }
}