"use client";

type AccessResult = {
  hasAccess: boolean;
  redirectTo?: string;
};

export async function checkRouteAccess(pathname: string): Promise<AccessResult> {
  try {
    if (pathname === '/superadmin/login') {
      return { hasAccess: true };
    }
    const resp = await fetch('/api/auth/me', { method: 'GET', credentials: 'include' });
    if (!resp.ok) {
      return { hasAccess: false, redirectTo: '/superadmin/login' };
    }
    const data = await resp.json().catch(() => ({}));
    const role = String(data?.role || '');
    if (role !== 'superadmin') {
      return { hasAccess: false, redirectTo: '/superadmin/login' };
    }
    return { hasAccess: true };
  } catch {
    return { hasAccess: false, redirectTo: '/superadmin/login' };
  }
}
