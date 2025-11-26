"use client";

type AccessResult = {
  hasAccess: boolean;
  redirectTo?: string;
};

export async function checkRouteAccess(pathname: string): Promise<AccessResult> {
  // Local-only phase: allow access to all routes (no auth)
  return { hasAccess: true };
}
