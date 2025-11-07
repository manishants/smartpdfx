"use client";

import { createClient } from '@/lib/supabase/client';
import { UserRole } from './roles';

type AccessResult = {
  hasAccess: boolean;
  redirectTo?: string;
};

export async function checkRouteAccess(pathname: string): Promise<AccessResult> {
  try {
    // Public routes
    if (!pathname.startsWith('/superadmin') && !pathname.startsWith('/admin')) {
      return { hasAccess: true };
    }

    // Always allow login pages
    if (pathname === '/superadmin/login' || pathname === '/admin/login') {
      return { hasAccess: true };
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