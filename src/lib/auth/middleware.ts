"use client";

import { LOCAL_SUPERADMIN_KEY, LOCAL_ADMIN_KEY } from './roles';

type AccessResult = {
  hasAccess: boolean;
  redirectTo?: string;
};

export async function checkRouteAccess(pathname: string): Promise<AccessResult> {
  try {
    // Allow all public routes
    if (!pathname.startsWith('/superadmin') && !pathname.startsWith('/admin')) {
      return { hasAccess: true };
    }

    // Always allow the respective login pages
    if (pathname === '/superadmin/login' || pathname === '/admin/login') {
      return { hasAccess: true };
    }

    // Local session flags in browser storage
    const isSuperadmin = typeof window !== 'undefined' && window.localStorage.getItem(LOCAL_SUPERADMIN_KEY) === 'true';
    const isAdmin = typeof window !== 'undefined' && window.localStorage.getItem(LOCAL_ADMIN_KEY) === 'true';

    if (pathname.startsWith('/superadmin')) {
      if (isSuperadmin) return { hasAccess: true };
      return { hasAccess: false, redirectTo: '/superadmin/login' };
    }

    if (pathname.startsWith('/admin')) {
      if (isAdmin || isSuperadmin) return { hasAccess: true };
      return { hasAccess: false, redirectTo: '/admin/login' };
    }

    return { hasAccess: true };
  } catch {
    // On any error, be defensive and require login
    if (pathname.startsWith('/superadmin')) {
      return { hasAccess: false, redirectTo: '/superadmin/login' };
    }
    if (pathname.startsWith('/admin')) {
      return { hasAccess: false, redirectTo: '/admin/login' };
    }
    return { hasAccess: true };
  }
}

export function setLocalSuperadminSession(enabled: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_SUPERADMIN_KEY, enabled ? 'true' : 'false');
}

export function setLocalAdminSession(enabled: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_ADMIN_KEY, enabled ? 'true' : 'false');
}